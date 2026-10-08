<?php
/**
 * Laboratorio Lamar — envío de formularios (Contacto, Distribuidores, CV).
 * Funciona en Hostinger (PHP + mail()). No requiere base de datos.
 *
 * >>> CONFIGURAR: casilla que recibe los mensajes <<<
 */
$DESTINO   = 'info@laboratoriolamar.com';   // ← cambiar por el email real del laboratorio
$REMITENTE = 'web@laboratoriolamar.com';    // ← una casilla del MISMO dominio (evita que caiga en spam)

// Destinos opcionales por formulario (dejar vacío para usar $DESTINO)
$DESTINOS = [
  'contacto'     => '',
  'distribuidor' => '',
  'cv'           => '',
];

/* ------------------------------------------------------------------ */
header('X-Content-Type-Options: nosniff');
$wantsJson = isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false;

function responder($ok, $error = '') {
  global $wantsJson;
  if ($wantsJson) {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code($ok ? 200 : 400);
    echo json_encode(['ok' => $ok, 'error' => $error], JSON_UNESCAPED_UNICODE);
  } else {
    $volver = isset($_SERVER['HTTP_REFERER']) ? strtok($_SERVER['HTTP_REFERER'], '?') : 'index.html';
    header('Location: ' . $volver . '?enviado=' . ($ok ? '1' : '0'));
  }
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') responder(false, 'Método no permitido.');
if (!empty($_POST['website'])) responder(true); // honeypot: bots

$limpiar = function ($v) { return trim(str_replace(["\r", "\n"], ' ', strip_tags((string)$v))); };
$tipo = isset($_POST['formulario']) ? $_POST['formulario'] : 'contacto';
if (!in_array($tipo, ['contacto', 'distribuidor', 'cv'], true)) $tipo = 'contacto';

$campos = [
  'contacto'     => ['nombre' => 'Nombre', 'email' => 'Email', 'telefono' => 'Teléfono', 'asunto' => 'Motivo', 'mensaje' => 'Mensaje'],
  'distribuidor' => ['empresa' => 'Empresa', 'cuit' => 'CUIT', 'provincia' => 'Provincia', 'localidad' => 'Localidad',
                     'nombre' => 'Contacto', 'email' => 'Email', 'telefono' => 'Teléfono', 'mensaje' => 'Mensaje'],
  'cv'           => ['nombre' => 'Nombre', 'email' => 'Email', 'telefono' => 'Teléfono', 'localidad' => 'Localidad', 'area' => 'Área de interés',
                     'linkedin' => 'LinkedIn', 'mensaje' => 'Mensaje'],
][$tipo];
$requeridos = [
  'contacto'     => ['nombre', 'email', 'asunto', 'mensaje'],
  'distribuidor' => ['empresa', 'provincia', 'localidad', 'nombre', 'email', 'telefono'],
  'cv'           => ['nombre', 'email', 'telefono', 'area'],
][$tipo];

$datos = [];
foreach ($campos as $k => $label) {
  $v = isset($_POST[$k]) ? $_POST[$k] : '';
  $datos[$k] = $k === 'mensaje' ? trim(strip_tags((string)$v)) : $limpiar($v);
  if (mb_strlen($datos[$k]) > 5000) $datos[$k] = mb_substr($datos[$k], 0, 5000);
}
foreach ($requeridos as $k) if ($datos[$k] === '') responder(false, 'Faltan completar campos obligatorios.');
if (!filter_var($datos['email'], FILTER_VALIDATE_EMAIL)) responder(false, 'El email no es válido.');

$titulos = ['contacto' => 'Nueva consulta desde la web', 'distribuidor' => 'Nueva solicitud de distribución', 'cv' => 'Nuevo CV recibido'];
$asunto = $titulos[$tipo] . ' — ' . $datos['nombre'];

$cuerpo = $titulos[$tipo] . "\n" . str_repeat('=', 40) . "\n\n";
foreach ($campos as $k => $label) {
  if ($datos[$k] === '') continue;
  $cuerpo .= $k === 'mensaje' ? "\n$label:\n{$datos[$k]}\n" : "$label: {$datos[$k]}\n";
}
$cuerpo .= "\n--\nEnviado desde laboratoriolamar.com el " . date('d/m/Y H:i') . "\n";

$para = !empty($DESTINOS[$tipo]) ? $DESTINOS[$tipo] : $DESTINO;
$headers  = "From: Web Laboratorio Lamar <$REMITENTE>\r\n";
$headers .= "Reply-To: " . $datos['nombre'] . " <" . $datos['email'] . ">\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$asuntoCod = '=?UTF-8?B?' . base64_encode($asunto) . '?=';

// Adjunto (solo CV)
$adjunto = null;
if ($tipo === 'cv') {
  if (empty($_FILES['cv']) || $_FILES['cv']['error'] !== UPLOAD_ERR_OK) responder(false, 'Adjunte su CV.');
  $f = $_FILES['cv'];
  if ($f['size'] > 5 * 1024 * 1024) responder(false, 'El archivo supera los 5 MB.');
  $ext = strtolower(pathinfo($f['name'], PATHINFO_EXTENSION));
  if (!in_array($ext, ['pdf', 'doc', 'docx'], true)) responder(false, 'El CV debe ser PDF o Word.');
  $mimes = ['pdf' => 'application/pdf', 'doc' => 'application/msword', 'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  $nombreArchivo = preg_replace('/[^A-Za-z0-9._-]+/', '_', 'CV_' . $datos['nombre'] . '.' . $ext);
  $adjunto = ['nombre' => $nombreArchivo, 'mime' => $mimes[$ext], 'data' => file_get_contents($f['tmp_name'])];
}

if ($adjunto) {
  $limite = 'lamar_' . md5(uniqid('', true));
  $headers .= "Content-Type: multipart/mixed; boundary=\"$limite\"\r\n";
  $mensaje  = "--$limite\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n";
  $mensaje .= chunk_split(base64_encode($cuerpo)) . "\r\n";
  $mensaje .= "--$limite\r\nContent-Type: {$adjunto['mime']}; name=\"{$adjunto['nombre']}\"\r\n";
  $mensaje .= "Content-Transfer-Encoding: base64\r\nContent-Disposition: attachment; filename=\"{$adjunto['nombre']}\"\r\n\r\n";
  $mensaje .= chunk_split(base64_encode($adjunto['data'])) . "\r\n--$limite--";
} else {
  $headers .= "Content-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n";
  $mensaje = chunk_split(base64_encode($cuerpo));
}

$enviado = @mail($para, $asuntoCod, $mensaje, $headers, '-f' . $REMITENTE);
responder($enviado, $enviado ? '' : 'El servidor no pudo enviar el mensaje.');
