<?php  include "layout/head.php"; ?>
<!-- Include jsTree CSS -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jstree/3.3.16/themes/default/style.min.css" />

<?php
include "layout/nav.php";
include "layout/header.php";
include "../koneksi.php";
// Fetch data from the database
$query = "SELECT * FROM data ORDER BY parent ASC, id ASC";
$result = $conn->query($query);

$nodes = array();
$interactiveParents = array();
$parentChildren = array();

while ($row = $result->fetch_assoc()) {
    $parent = ($row['parent'] === NULL) ? "#" : $row['parent'];
    if ($row['type'] === 'interactive') {
        $interactiveParents[$parent] = $row['id'];
    }

    if ($row['type'] === 'row' && array_key_exists($parent, $interactiveParents)) {
        $parent = $interactiveParents[$parent];
    }

    $text = "(" . $row['type'] . ") ";
    $text .= (!empty($row['header']) ? $row['header'] : $row['body']);
    $text = (strlen($text) > 150) ? substr($text, 0, 150) . "..." : $text;

    // Determine the correct update link based on the node type
    $updateLink = "";
    switch ($row['type']) {
        case "text":
            $updateLink = "update_text.php?id=" . $row['id'];
            break;
        case "interactive":
            $updateLink = "update_interactive.php?id=" . $row['id'];
            break;
        case "row":
            $updateLink = "update_row.php?id=" . $row['id'];
            break;
        case "interactive_back":
            $updateLink = "update_interactive_back.php?id=" . $row['id'];
            break;
    }

    $nodes[] = array(
        "id" => $row['id'],
        "parent" => $parent,
        "text" => $text,
        "a_attr" => array("href" => $updateLink)
    );

    $parentChildren[$parent] = isset($parentChildren[$parent]) ? $parentChildren[$parent] + 1 : 1;
}


// Add custom nodes for each parent that has children
foreach ($parentChildren as $parentId => $count) {
    if ($parentId != "#") {
        $foundNode = array_values(array_filter($nodes, function ($node) use ($parentId) {
            return $node['id'] == $parentId;
        }));
        if (!empty($foundNode)) {
            $nodeType = substr($foundNode[0]['text'], 1, strpos($foundNode[0]['text'], ')') - 1);
            $parentID = $foundNode[0]['parent']; // Get the parent ID for the custom link

            if ($nodeType == 'interactive') {
                $text = "+ Tambah row";
                $link = "add_row.php?id=$parentID"; // Link to the parent of the interactive node
            } else {
                $text = "+ Tambah text, interactive, interactive_back";
                $link = "add_umum.php?id=$parentId"; // Link to the node itself
            }

            $nodes[] = array(
                "id" => "custom" . $parentId, // Create a unique ID for the custom node
                "parent" => $parentId,
                "text" => $text,
                "a_attr" => array("href" => $link)
            );
        }
    }
}

$json_data = json_encode($nodes);
?>

<!-- Include jQuery -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
<!-- Include jsTree script -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jstree/3.3.16/jstree.min.js" defer></script>

 <!-- page content -->
<div class="right_col" role="main">
    <div class="">
        <div class="page-title">
            <div class="title_left">
                <h3> Data SKPM <small>Sistem Kredit Poin Mahasiswa</small></h3>
            </div>
        </div>

        <div class="clearfix"></div>
        <div class="row">
            <div class="col-md-12 col-sm-12 col-xs-12">
                <div class="x_panel">
                    <div class="x_title">
                        <!--<h2><a href="add_akar.php"><i class="fa fa-plus"></i> Tambah Akar</a></h2> -->
                        <div class="clearfix"></div>
                    </div>
                    <div class="x_content">
                        <!-- jsTree container -->
                        <div id="jstree"></div>
                        <script>
                            $(document).ready(function() {
                              $('#jstree').jstree({
                                    'core' : {
                                        'data' : <?php echo $json_data; ?>
                                    },
                                    'plugins' : ["state"],  // Enable state plugin
                                    'state' : {
                                        "key" : "jstree"  // Key to use for local storage
                                    }
                                });

                                // Bind an event to handle right-clicks on links within the jsTree
                                $('#jstree').on('contextmenu', 'a', function(e) {
                                    e.preventDefault();  // Prevent the default context menu
                                    var href = this.href;  // Get the href from the link
                                    if(href) {
                                        window.location.href = href;  // Navigate in the same tab
                                    }
                                });
                            });
                        </script>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<?php include "layout/footer.php"; ?>
