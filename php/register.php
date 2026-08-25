<?php
require 'db.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$name  = $_POST['name']  ?? '';
$email = $_POST['email'] ?? '';
$phone = $_POST['phone'] ?? '';
$pass  = $_POST['pass']  ?? '';
$role  = $_POST['role']  ?? 'user';

if (!$name || !$email || !$pass) {
  echo json_encode(['error' => 'Fill all fields']);
  exit;
}

// VULN: Password stored in plaintext - no hashing
try {
  $stmt = $pdo->prepare("INSERT INTO users (name,email,phone,password,role) VALUES (?,?,?,?,?)");
  $stmt->execute([$name,$email,$phone,$pass,$role]);
  echo json_encode(['success' => 'Account created']);
} catch(PDOException $e) {
  echo json_encode(['error' => 'Email already exists']);
}
?>
