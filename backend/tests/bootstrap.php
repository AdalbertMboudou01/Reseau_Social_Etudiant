<?php

use Symfony\Component\Dotenv\Dotenv;

require dirname(__DIR__).'/vendor/autoload.php';

$jwtDir = dirname(__DIR__).'/config/jwt';
if (!is_dir($jwtDir)) {
    mkdir($jwtDir, 0775, true);
}
if (!file_exists($jwtDir.'/private.pem') || !file_exists($jwtDir.'/public.pem')) {
    $pk = openssl_pkey_new([
        'private_key_bits' => 2048,
        'private_key_type' => OPENSSL_KEYTYPE_RSA,
    ]);
    if ($pk === false) {
        throw new RuntimeException('Impossible de générer les clés JWT (extension OpenSSL ?).');
    }
    openssl_pkey_export($pk, $privateKey);
    $publicKey = openssl_pkey_get_details($pk)['key'];
    file_put_contents($jwtDir.'/private.pem', $privateKey);
    file_put_contents($jwtDir.'/public.pem', $publicKey);
}

if (method_exists(Dotenv::class, 'bootEnv')) {
    (new Dotenv())->bootEnv(dirname(__DIR__).'/.env');
}

$_SERVER['JWT_PASSPHRASE'] = $_ENV['JWT_PASSPHRASE'] = '';

if (($_SERVER['APP_DEBUG'] ?? false) || (filter_var($_SERVER['APP_DEBUG'] ?? false, FILTER_VALIDATE_BOOLEAN))) {
    umask(0000);
}
