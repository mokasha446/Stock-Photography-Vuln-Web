<?php
$host   = 'localhost';
$dbname = 'dummydbname';
$user   = 'dummyuser';
$pass   = 'dummypass';   // change if you chose a different password

try {
  $pdo = new PDO(
    "mysql:host=$host;dbname=$dbname;charset=utf8",
    $user, $pass
  );
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
  die(json_encode(['error' => $e->getMessage()]));
}
?>
