<!doctype html>

<html lang="de">
    <head>

        <!-- Header -->
        <%@ include file="_include/header.jsp" %>

    </head>
    <body>

        <!-- Navigation -->
        <%@ include file="_include/navigation.jsp" %>

        <!-- Container -->
        <div class="container">
            <div class="container-fluid">
                <div class="row-fluid">

                    <!-- Sidebar -->
                    <div class="span3">
                        <div class="sidebar-nav">
                            <ul class="nav nav-list bs-docs-sidenav affix" id="sidebar">
                                <li class="sidebar"><a href="#" class="ibn">IBN</a></li>
                                <li class="sidebar"><a href="#" class="htwg">HTWG Konstanz</a></li>
                            </ul>
                        </div>
                    </div><!-- Sidebar -->

                    <!-- Content -->
                    <div class="span9">
                        <div class="post" id="ibn">
                            <h2>IBN</h2>
                            <div class="entry">	
                                <img src="../img/icons/ibn.jpg" class="img-rounded" alt="IBN Konstanz"/>
				<br><br>
                                <p>
                                    IBN Redaktion <br>
                                    Hans-Dieter M&ouml;hlhenrich<br>
                                    Malvine-Schiesser-Weg 3<br>
                                    78315 Radolfzell<br>
                                    Germany<br>
                                    <br>
                                    <a href="http://www.ibn-online.de">www.ibn-online.de</a><br>
                                    ibn at ibn-online.de
                                </p>		 
                            </div>
                        </div>
                        <br><br>
                        <div class="post" id="htwg">
                            <h2>HTWG Konstanz</h2>
                            <div class="entry">
                                <img src="../img/icons/htwg.png" class="img-rounded" alt="HTWG Konstanz"/>
				<br><br>
                                <p>
                                    HTWG Konstanz<br>
                                    Informatik<br>
                                    Prof. Dr. Marko Boger<br>
                                    Brauneggerstr. 55<br>
                                    78462 Konstanz<br>
                                    Germany<br>
                                    <br>
                                    <a href="http://www.htwg-konstanz.de">www.htwg-konstanz.de</a><br>
                                    marko.boger at htwg-konstanz.de
                                </p>
                                <br>
                                <br>
                            </div>
                        </div>
                    </div><!-- Content -->
                </div>
            </div>		
        </div><!-- Container -->

        <!-- Footer -->
        <%@ include file="_include/footer.jsp" %>

        <!-- Java-Script -->
	<script src="../js/bootstrap/bootstrap-transition.js"></script>
        <script src="../js/bootstrap/bootstrap-button.js"></script>
        <script src="../js/bootstrap/bootstrap-collapse.js"></script>
        <script src="../js/bootstrap/bootstrap-affix.js"></script>

    </body>
</html>