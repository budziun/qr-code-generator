<?php
session_start();


if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    unset($_SESSION['qrCodeDataUri']);
}


spl_autoload_register(function ($class) {
    $prefixEndroid = 'Endroid\\QrCode\\';
    $prefixBacon = 'BaconQrCode\\';
    $prefixDasprid = 'DASPRiD\\Enum\\';

    $base_dir_endroid = __DIR__ . '/endroid-qr-code/src/';
    $base_dir_bacon = __DIR__ . '/bacon-qr-code/src/';
    $base_dir_dasprid = __DIR__ . '/dasprid-enum/src/';

    if (strncmp($prefixEndroid, $class, strlen($prefixEndroid)) === 0) {
        $relative_class = substr($class, strlen($prefixEndroid));
        $file = $base_dir_endroid . str_replace('\\', '/', $relative_class) . '.php';
        if (file_exists($file)) {
            require $file;
        }
    }

    if (strncmp($prefixBacon, $class, strlen($prefixBacon)) === 0) {
        $relative_class = substr($class, strlen($prefixBacon));
        $file = $base_dir_bacon . str_replace('\\', '/', $relative_class) . '.php';
        if (file_exists($file)) {
            require $file;
        }
    }

    if (strncmp($prefixDasprid, $class, strlen($prefixDasprid)) === 0) {
        $relative_class = substr($class, strlen($prefixDasprid));
        $file = $base_dir_dasprid . str_replace('\\', '/', $relative_class) . '.php';
        if (file_exists($file)) {
            require $file;
        }
    }
});

use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Writer\PngWriter;


if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST['url'])) {
    $url = htmlspecialchars($_POST['url']); 

    $qrCode = Builder::create()
        ->writer(new PngWriter())
        ->data($url)
        ->build();

    $_SESSION['qrCodeDataUri'] = $qrCode->getDataUri();
}

$qrCodeDataUri = $_SESSION['qrCodeDataUri'] ?? null;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="style.css">
    <title>QR code generator</title>
</head>
<body>
    <div>
        <h1 data-text="QR code generator">QR code generator</h1>
        <div id="input-container" class="<?= !empty($qrCodeDataUri) ? 'expanded' : '' ?>">
            <form action="index.php" method="POST">
                <br>
                <input type="text" id="url" name="url" required>
                    <label for="url">Type your text or link below:</label>
                <button type="submit" id="sbmBTN">Generate</button>
            </form>
            <div id="qrshow" class="<?= !empty($qrCodeDataUri) ? 'visible' : '' ?>">
                <?php if (!empty($qrCodeDataUri)): ?>
                    <img id="qrImage" src="<?= $qrCodeDataUri ?>" alt="QR">
                    <button id="download-btn">Download</button>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <script>
    document.addEventListener("DOMContentLoaded", function() {
        var qrImage = document.getElementById("qrImage");
        var downloadBtn = document.getElementById("download-btn");

        if (downloadBtn) {
            downloadBtn.addEventListener("click", function() {
                var randomNum = Math.floor(10000 + Math.random() * 90000);
                var fileName = 'qrcode_' + randomNum + '.png';

                var link = document.createElement('a');
                link.href = qrImage.src;
                link.download = fileName; 
                link.click();
            });
        }
    });
</script>
</body>
</html>
