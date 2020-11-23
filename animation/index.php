
<!DOCTYPE html>
<html lang="en-us">
<head>
	<meta charset="utf-8">
	<meta http-equiv="Content-Script-Type" content="text/javascript">
	<meta http-equiv="Content-Style-Type" content="text/css">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">
	<meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-title" content="YKDHAN" />
	<link rel="shortcut icon" href="/icon/ykdhan.ico" type="image/x-icon">
	<link rel="apple-touch-icon" href="/icon/ykdhan.png"/>
	<link rel="apple-touch-icon" sizes="114x114" href="/icon/ykdhan-114.png" />
    <link rel="apple-touch-icon" sizes="144x144" href="/icon/ykdhan-144.png" />
	<link rel="stylesheet" type="text/css" href="/style.css">
    <link rel="stylesheet" type="text/css" href="/animate.css">
	
	<title>David YK Han</title>
    
    <style>
        .animated-long {
            animation-duration: 2s;
        }
    </style>
	

    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
    <script src="http://cdnjs.cloudflare.com/ajax/libs/modernizr/2.8.2/modernizr.js"></script>
    <script>
	   $(window).load(function() {
           // Animate loader off screen
           $(".se-pre-con").fadeOut("slow");;
	   });
    </script>
    
    



<?php
/*
include("config.php");

$link = mysql_connect($server, $db_user, $db_pass)
or die ("<br><br><br><br><br><br><br><br>MYSQL 연결 실패 ".mysql_error());

mysql_query("set names utf8");

mysql_select_db($database)
or die ("<br><br><br><br><br><br><br><br>DB 연결 실패 ".mysql_error());

$page = isset($_GET['p']) ? (int)$_GET['p'] : 1;
$perpage = 16;

$start = ($page > 1) ? ($page * $perpage) - $perpage : 0;

if(isset($_GET['search'])){$check = "select * from music WHERE title LIKE '%".$_GET['search']."%' OR singer LIKE '%".$_GET['search']."%' OR album LIKE '%".$_GET['search']."%' OR lyric LIKE '%".$_GET['search']."%' ";}
else {$check = "select * from music ORDER BY id DESC LIMIT {$start}, {$perpage}";}

$qry = mysql_query($check) or die ("<br><br><br><br><br><br><br><br>SELECT 실패 ".mysql_error());
$num_rows = mysql_num_rows($qry); 

$checkall = "select * from music";
$qryall = mysql_query($checkall) or die ("<br><br><br><br><br><br><br><br>SELECT 실패 ".mysql_error());
$total = mysql_num_rows($qryall); 
$pages = ceil($total/$perpage);
*/
?>

</head>
<body>

    
<div class="center" align="center">
	<div class="logo animated fadeInDown">
        <img alt="" id="logo" src="/icon/dhdh.png">
	</div>
    <div class="content animated fadeInUp">
        <h1>David YK Han</h1>
        <p>A web designer and developer.</p>
    </div>
	<div class="link animated animated-long fadeIn">
        <a href="https://twitter.com/ykdhan" target="_blank"><img alt="" src="/icon/twitter.png" /></a>
        <a href="https://www.instagram.com/ykdhan/" target="_blank"><img alt="" src="/icon/instagram.png" /></a>
        <a href="https://www.linkedin.com/in/ykdhan/" target="_blank"><img alt="" src="/icon/linkedin.png" /></a>
        <a href="https://www.youtube.com/c/ykdhan" target="_blank"><img alt="" src="/icon/youtube.png" /></a>
    </div>
</div>
    

    

<script type="text/javascript" src="http://code.jquery.com/jquery-1.8.3.min.js"></script>


</body>
</html>