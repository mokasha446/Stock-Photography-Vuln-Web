<?php
require 'db.php';
header('Content-Type: application/json');

$id = $_GET['id'] ?? 0;
if (!$id) {
  echo json_encode(['error' => 'ID required']);
  exit;
}

$stmt = $pdo->prepare("SELECT * FROM sketches WHERE id = ?");
$stmt->execute([$id]);
$sketch = $stmt->fetch(PDO::FETCH_ASSOC);

if ($sketch) {
  echo json_encode($sketch);
} else {
  echo json_encode(['error' => 'Sketch not found']);
}
?>
