<?php
include "../koneksi.php"; // Ensure your database connection file is correctly referenced

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $id = $_POST['id'] ?? null;
    $type = $_POST['type'] ?? '';
    $header = $_POST['header'] ?? NULL; // Accept NULL if header is not provided
    $body = $_POST['body'] ?? '';
    $parentId = $_POST['parentId'] ?? null;

    // SQL query to update the data
    $query = "UPDATE `data` SET `parent` = ?, `type` = ?, `header` = ?, `body` = ? WHERE `id` = ?";
    if ($stmt = mysqli_prepare($conn, $query)) {
        mysqli_stmt_bind_param($stmt, "isssi", $parentId, $type, $header, $body, $id);
        if (mysqli_stmt_execute($stmt)) {
            header("Location: dashboard.php"); // Redirect to dashboard on successful update
            exit();
        } else {
            echo "Error: " . mysqli_stmt_error($stmt); // Display SQL execution error
        }
        mysqli_stmt_close($stmt);
    } else {
        echo "Error preparing the statement: " . mysqli_error($conn); // Display statement preparation error
    }
    mysqli_close($conn);
}
?>
