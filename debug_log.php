<?php
require __DIR__.'/laravel/vendor/autoload.php';
$app = require_once __DIR__.'/laravel/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();

echo '<h1>Laravel Error Log</h1>';
$logPath = __DIR__.'/laravel/storage/logs/laravel.log';
if (file_exists($logPath)) {
    echo '<pre>' . tailCustom($logPath, 20) . '</pre>';
} else {
    echo 'Log file not found.';
}

function tailCustom($filepath, $lines = 10) {
    $data = file($filepath);
    return implode('', array_slice($data, -$lines));
}
