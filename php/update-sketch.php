<?php
require 'db.php';
header('Content-Type: application/json');

$id       = $_POST['id']       ?? 0;
$title    = $_POST['title']    ?? '';
$artist   = $_POST['artist']   ?? '';
$category = $_POST['category'] ?? '';
$price    = $_POST['price']    ?? 0;

if (!$id || !$title || !$price) {
  echo json_encode(['error' => 'Missing required fields']);
  exit;
}

// Get current images
$stmt = $pdo->prepare("SELECT image, images FROM sketches WHERE id=?");
$stmt->execute([$id]);
$sketch = $stmt->fetch();

$mainImage = $sketch['image'];
$allImages = $sketch['images'];

// Handle main image update
if (!empty($_FILES['image']['name'])) {
  $upload_dir = '../images/sketches/';
  if (!is_dir($upload_dir)) mkdir($upload_dir, 0777, true);
  $filename = time() . '_' . $_FILES['image']['name'];
  move_uploaded_file($_FILES['image']['tmp_name'], $upload_dir . $filename);
  $mainImage = $filename;
  
  $imagesArray = !empty($allImages) ? explode(',', $allImages) : [];
  if (!empty($imagesArray)) {
    $imagesArray[0] = $filename;
    $allImages = implode(',', $imagesArray);
  } else {
    $allImages = $filename;
  }
}

// Handle additional images
if (!empty($_FILES['extra_images']['name'][0])) {
  $upload_dir = '../images/sketches/';
  if (!is_dir($upload_dir)) mkdir($upload_dir, 0777, true);
  $imagesArray = !empty($allImages) ? explode(',', $allImages) : [];
  
  foreach ($_FILES['extra_images']['name'] as $key => $name) {
    if ($_FILES['extra_images']['error'][$key] === 0) {
      $filename = time() . '_' . $key . '_' . $name;
      move_uploaded_file($_FILES['extra_images']['tmp_name'][$key], $upload_dir . $filename);
      $imagesArray[] = $filename;
    }
  }
  $allImages = implode(',', $imagesArray);
}

try {
  $stmt = $pdo->prepare("UPDATE sketches SET title=?, artist=?, category=?, price=?, image=?, images=? WHERE id=?");
  $stmt->execute([$title, $artist, $category, $price, $mainImage, $allImages, $id]);
  echo json_encode(['success' => true]);
} catch(PDOException $e) {
  echo json_encode(['error' => $e->getMessage()]);
}
?>