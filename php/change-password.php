<?php
require 'db.php';
header('Content-Type: application/json');
$email       = $_POST['email']       ?? '';
$currentPass = $_POST['currentPass'] ?? '';
$newPass     = $_POST['newPass']     ?? '';
if (!$email || !$currentPass || !$newPass) {
  echo json_encode(['error' => 'All fields required']);
  exit;
}
$stmt = $pdo->prepare("SELECT * FROM users WHERE email=? AND password=?");
$stmt->execute([$email, $currentPass]);
$user = $stmt->fetch();
if (!$user) {
  echo json_encode(['error' => 'Current password is incorrect']);
  exit;
}
$stmt = $pdo->prepare("UPDATE users SET password=? WHERE email=?");
$stmt->execute([$newPass, $email]);
echo json_encode(['success' => true]);
