<?php
include "../koneksi.php"; // Ensure your database connection file is correctly referenced

if (isset($_GET['id'])) {
    $id = $_GET['id'];

    // First, check if there are any child records
    $queryCheck = "SELECT COUNT(*) as childCount FROM `data` WHERE `parent` = ?";
    if ($stmtCheck = mysqli_prepare($conn, $queryCheck)) {
        mysqli_stmt_bind_param($stmtCheck, "i", $id);
        mysqli_stmt_execute($stmtCheck);
        $resultCheck = mysqli_stmt_get_result($stmtCheck);
        $rowCheck = mysqli_fetch_assoc($resultCheck);
        mysqli_stmt_close($stmtCheck);

        if ($rowCheck['childCount'] > 0) {
            // If there are child records, prevent deletion and inform the user with an alert
            echo "<script>alert('Please delete all child entries first.'); window.location='dashboard.php';</script>";
            exit;
        } else {
            // If there are no child records, proceed with deletion
            $queryDelete = "DELETE FROM `data` WHERE `id` = ?";
            if ($stmtDelete = mysqli_prepare($conn, $queryDelete)) {
                mysqli_stmt_bind_param($stmtDelete, "i", $id);
                if (mysqli_stmt_execute($stmtDelete)) {
                    echo "<script>alert('Record successfully deleted.'); window.location='dashboard.php';</script>";
                    exit();
                } else {
                    echo "Error: " . mysqli_stmt_error($stmtDelete); // Display SQL execution error
                }
                mysqli_stmt_close($stmtDelete);
            } else {
                echo "Error preparing the statement: " . mysqli_error($conn); // Display statement preparation error
            }
        }
    } else {
        echo "Error preparing the statement: " . mysqli_error($conn); // Error in preparing the check statement
    }
    mysqli_close($conn);
} else {
    // Redirect back if no ID is provided
    header("Location: dashboard.php");
}
?>
