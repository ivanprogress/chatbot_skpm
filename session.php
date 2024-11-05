<?php
error_reporting(0);
include "koneksi.php";
session_start();// Memulai Session
// Menyimpan Session
$user_check=$_SESSION['USERNAME'];

// Ambil nama karyawan berdasarkan username karyawan dengan mysql_fetch_assoc
$sql = "select * from user where USERNAME='$user_check'" ;
$ses_sql=mysqli_query($conn,$sql);
$row = mysqli_fetch_assoc($ses_sql);
$login_session =$row['ID_USER'];
$full =$row['FULLNAME'];
$level =$row['LEVEL'];
$pass =$row['PASSWORD'];
$id_user =$row['ID_USER'];

//Set the session duration for 10 seconds

$duration = 10*60;

//Read the request time of the user

$time = $_SERVER['REQUEST_TIME'];


//Check the user's session exist or not

if (isset($_SESSION['LAST_ACTIVITY']) &&

   ($time - $_SESSION['LAST_ACTIVITY']) > $duration) {

    //Unset the session variables

    session_unset();

    //Destroy the session

    session_destroy();

    //Start another new session

    session_start();

} 


//Set the time of the user's last activity

$_SESSION['LAST_ACTIVITY'] = $time;
?>