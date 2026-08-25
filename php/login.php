<?php
require 'db.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$email = $_POST['email'] ?? '';
$pass  = $_POST['pass']  ?? '';

if (!$email || !$pass) {
  echo json_encode(['error' => 'Fill all fields']);
  exit;
}

// VULN: No brute force protection
// VULN: Plaintext password comparison
$stmt = $pdo->prepare("SELECT * FROM users WHERE email=? AND password=?");
$stmt->execute([$email, $pass]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user) {
  // VULN: Returning full user data including password
  echo json_encode([
    'success'  => true,
    'id'       => $user['id'],
    'name'     => $user['name'],
    'email'    => $user['email'],
    'role'     => $user['role'],
    'password' => $user['password']
  ]);
} else {
  // VULN: Username enumeration
  $check = $pdo->prepare("SELECT id FROM users WHERE email=?");
  $check->execute([$email]);
  if ($check->fetch()) {
    echo json_encode(['error' => 'Wrong password for: '.$email]);
  } else {
    echo json_encode(['error' => 'No account found: '.$email]);
  }
}
?>
