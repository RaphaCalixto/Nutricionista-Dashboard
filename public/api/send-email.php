<?php
// CORS and JSON Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Método não permitido. Use POST."]);
    exit;
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Dados JSON inválidos."]);
    exit;
}

// Default credentials
$defaultApiKey = base64_decode('cmVfV2t0THVZQkJfTmdLcng2M2RzZ0tZeDNRcUpuM29OZVdu');
$apiKey = !empty($data['apiKey']) ? trim($data['apiKey']) : $defaultApiKey;

$to = !empty($data['to']) ? $data['to'] : [];
if (is_string($to)) {
    $to = [$to];
}

$from = !empty($data['from']) ? $data['from'] : 'NutriPlan Pro <suporte@pacientenutri.com.br>';
$replyTo = !empty($data['reply_to']) ? $data['reply_to'] : 'nutrihealthplan@gmail.com';
$subject = !empty($data['subject']) ? $data['subject'] : 'Código de Recuperação - NutriPlan Pro';
$html = !empty($data['html']) ? $data['html'] : '';

if (empty($to) || empty($html)) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Destinatário ou corpo do e-mail ausente."]);
    exit;
}

$payload = [
    "from" => $from,
    "to" => $to,
    "reply_to" => $replyTo,
    "subject" => $subject,
    "html" => $html
];

// Send via cURL to Resend
$ch = curl_init('https://api.resend.com/emails');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $apiKey
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Erro cURL: " . $curlError]);
    exit;
}

$resData = json_decode($response, true);

if ($httpCode >= 200 && $httpCode < 300) {
    echo json_encode([
        "success" => true,
        "id" => isset($resData['id']) ? $resData['id'] : null,
        "data" => $resData
    ]);
} else {
    // If domain error, try with onboarding@resend.dev
    if (isset($resData['message']) && (stripos($resData['message'], 'domain') !== false || stripos($resData['message'], 'verify') !== false)) {
        $payload['from'] = 'NutriPlan Pro <onboarding@resend.dev>';
        $ch2 = curl_init('https://api.resend.com/emails');
        curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch2, CURLOPT_POST, true);
        curl_setopt($ch2, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch2, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $apiKey
        ]);
        curl_setopt($ch2, CURLOPT_TIMEOUT, 15);
        curl_setopt($ch2, CURLOPT_SSL_VERIFYPEER, true);
        $response2 = curl_exec($ch2);
        $httpCode2 = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
        curl_close($ch2);
        
        $resData2 = json_decode($response2, true);
        if ($httpCode2 >= 200 && $httpCode2 < 300) {
            echo json_encode([
                "success" => true,
                "id" => isset($resData2['id']) ? $resData2['id'] : null,
                "data" => $resData2
            ]);
            exit;
        }
    }

    http_response_code($httpCode ?: 500);
    echo json_encode([
        "success" => false,
        "error" => isset($resData['message']) ? $resData['message'] : "Erro ao enviar e-mail ($httpCode)",
        "details" => $resData
    ]);
}
