<?php  include "layout/head.php"; ?>
<?php include "layout/nav.php"; ?>
<?php include "layout/header.php"; ?>
<?php include "../koneksi.php";
$query = "SELECT id_user,username,fullname,level FROM user where username != '$user_check'";
$query2 = "SELECT id_user,username,fullname,level FROM user where username = '$user_check'";
$result=$conn->query($query);
$result2=$conn->query($query2);
?>

 <!-- page content -->
        <div class="right_col" role="main">
          <div class="">
            <div class="page-title">
              <div class="title_left">
                <h3> DATA USER <small>Data User Admin Chatbot</small></h3>
              </div>
            </div>

            <div class="clearfix"></div>
    <div class="row">
      <div class="col-md-12 col-sm-12 col-xs-12">
                <div class="x_panel">
                  <div class="x_title">
                    <h2><a href="add_user.php"><i class="fa fa-plus"></i> ADD USER DATA</a></h2>

                    <div class="clearfix"></div>
                  </div>
                  <div class="x_content">

                    <table id="datatable-buttons" class="table table-striped table-bordered">
                      <thead>
                        <tr>
                          <th>ID_USER</th>
                          <th>NAME</th>
                          <th>FULLNAME</th>
                          <th>LEVEL</th>
                          <th>AKSI</th>

                        </tr>
                      </thead>


                      <tbody>
            <?php $i=0;

            $r2=mysqli_fetch_array($result2);

            ?>
             <tr>

            <td><?php echo $r2['0'] ?>
          </td>
            <td><?php echo $r2['1'] ?></td>
            <td><?php echo $r2['2'] ?></td>
            <td><?php echo $r2['3'] ?></td>
            <td>
              <!--<div style="background-color: #51BCA3; color: #ECF0F0; border-radius: 2px 2px 2px 2px; width: 120px;">-->
            <?php echo "Anda Sedang Login"; ?>

          </tr>

                        </tr>
            <?php
             while($r=mysqli_fetch_array($result))
            {
              $id_user = $r['0'];
              $username = $r['1'];
              $fullname = $r['2'];
              $level = $r['3'];
              ?>

                        <tr>
            <td><?php echo $id_user ?></td>
            <td><?php echo $username ?></td>
            <td><?php echo $fullname ?></td>
            <td><?php echo $level ?></td>
            <?php echo "<td class='center'><a href='update_user.php?update_id=$r[0]' class='btn btn-primary btn' title='Edit Data'><i class='fa fa-edit'></i></a>
                                    <a href='proses_user.php?delete_id=$r[0]' class='btn btn-danger btn' title='Delete'><i class='fa fa-trash'></i></a></td>"; ?>

                        </tr>
            <?php $i++; } ?>

                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
      </div>
    </div>
    </div>

<?php include "layout/footer.php"; ?>
