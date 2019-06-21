  let current_fs, next_fs, previous_fs;
  let left, opacity, scale;
  let animating;
  let tamVL = 0;
  let tamSL = 0;
  let ab = true,
      bc = true,
      cd = true,
      de = true;
  //definir qual prefere começa
  let cilindrica = false;
  let pR;
  let pPlano1;
  let pPlano2;
  let pPlano3;
  let centro;//valor do pontoDeVista
  let objeto;
  let vertices;
  let superficies;
  let pontoDeVista;//inutil
  $("#canvas").hide();
  $("#erroC").hide();
  $(".hideS").hide();
  $("#erroCC").hide();
  $("[name=nextS1]").hide();
  $("[name=nextS2]").hide();
  $("[name=nextS3]").hide();
  $(".menu").hide();
  $("[name=sTipoDeProjecao] option")[1].selected = true;

  function desenhaPonto(ponto) {
      var pointSize = 3; // Change according to the size of the point.
      var ctx = document.getElementById("canvas").getContext("2d");

      ctx.fillStyle = "#ffffff"; // White color

      ctx.beginPath(); //Start path
      ctx.arc(ponto.x, ponto.y, pointSize, 0, Math.PI * 2, true); // Draw a point using the arc function of the canvas with a point structure.
      ctx.fill(); // Close the path and fill.
  }

  function desenhaLinha(ponto1, ponto2) {
      var ctx = document.getElementById("canvas").getContext("2d")

      ctx.strokeStyle = "#ffffff";

      ctx.moveTo(ponto1.x, ponto1.y);
      ctx.lineTo(ponto2.x, ponto2.y);
      ctx.stroke();
  }

  /* function getPosition(event){
    var rect = canvas.getBoundingClientRect();
    var x0 = event.clientX - rect.left; // x == the location of the click in the document - the location (relative to the left) of the canvas in the document
    var y0 = event.clientY - rect.top; // y == the location of the click in the document - the location (relative to the top) of the canvas in the document

    // This method will handle the coordinates and will draw them in the canvas.
    desenhaPonto({x: x0,y: y0);
    console.log(x0, y0)
  }

  $("#canvas").click(function(e){
    getPosition(e)
  }) */

  function calculaNormal() {
      let nx = ((pPlano1.y - pPlano2.y) * (pPlano3.z - pPlano2.z)) - ((pPlano3.y - pPlano2.y) * (pPlano1.z - pPlano2.z));
      let ny = -1 * ((pPlano1.x - pPlano2.x) * (pPlano3.z - pPlano2.z)) - ((pPlano3.x - pPlano2.x) * (pPlano1.z - pPlano2.z));
      let nz = ((pPlano1.x - pPlano2.x) * (pPlano3.y - pPlano2.y)) - ((pPlano3.x - pPlano2.x) * (pPlano1.y - pPlano2.y));
      return {
          x: nx,
          y: ny,
          z: nz
      }
  }

  function calculaDs(normal, centro) {
      let d0 = pR.x * normal.x + pR.y * normal.y + pR.z * normal.z;
      let d1 = centro.x * normal.x + centro.y * normal.y + centro.z * normal.z;
      let d = d0 - d1;
      return {
          d0: d0,
          d1: d1,
          d: d
      }
  }

  function multiplyMatrices(m1, m2) {
      var result = [];
      for (var i = 0; i < m1.length; i++) {
          result[i] = [];
          for (var j = 0; j < m2[0].length; j++) {
              var sum = 0;
              for (var k = 0; k < m1[0].length; k++) {
                  sum += m1[i][k] * m2[k][j];
              }
              result[i][j] = sum;
          }
      }
      return result;
  }
  
  function multiplyMatricesJanela(m1, m2) {
      var result = [];
      for (var i = 0; i < 2; i++) {
          result[i] = [];
          for (var j = 0; j < m2[0].length; j++) {
              var sum = 0;
              for (var k = 0; k < m1[0].length; k++) {
                  sum += m1[i][k] * m2[k][j];
              }
              result[i][j] = sum;
          }
      }
      return result;
  }
  
  function multiplyMatricesV(m1, m2) {
      var result = [];
      for (var i = 0; i < m1.length; i++) {
          result[i] = [];
          for (var j = 0; j < m2.length; j++) {
              var sum = 0;
              for (var k = 0; k < m1[0].length; k++) {
				  if(k===0)
					sum += m1[i][k] * m2[j].x;
				  else if(k===1)
					sum += m1[i][k] * m2[j].y;
				  else if(k===2)
					sum += m1[i][k] * m2[j].z;
				  else
					sum += m1[i][k] * 1;
              }
              result[i][j] = sum;
          }
      }
      return result;
  }

  function montaMatrizPerspectivaCone(normal, centro, ds) {
      m = [
          [ds.d + centro.x * normal.x, centro.x * normal.y, centro.x * normal.z, -1 * centro.x * ds.d0],
          [centro.y * normal.x, ds.d + centro.y * normal.y, centro.y * normal.z, -1 * centro.y * ds.d0],
          [centro.z * normal.x, centro.z * normal.y, ds.d + centro.z * normal.z, -1 * centro.z * ds.d0],
          [normal.x, normal.y, normal.z, -1 * ds.d1]
      ];
      return m;
  }

  function montaMatrizPerspectivaCilindro(normal, centro, ds) {
      m = [
          [ds.d - centro.x * normal.x, -1 * centro.x * normal.y, -1 * centro.x * normal.z, centro.x * ds.d0],
          [-1 * centro.y * normal.x, ds.d - centro.y * normal.y, -1 * centro.y * normal.z, centro.y * ds.d0],
          [-1 * centro.z * normal.x, -1 * centro.z * normal.y, ds.d - centro.z * normal.z, centro.z * ds.d0],
          [0, 0, 0, ds.d1]
      ];
      return m;
  }

  function calculoP(mp, objeto, tjv) {
      let ph = multiplyMatricesV(mp, objeto);
      let linhaX= []
      let linhaY= []
      //let linhaZ= []
      let linhaW= []
      for(var i= 0; i<ph[0].length; i++){
        linhaX.push(ph[0][i] / ph[3][i])
        linhaY.push(-(ph[1][i] / ph[3][i]))
        //linhaZ.push(ph[2][i] / ph[3][i])
        linhaW.push(1)
      }
      //let wc = 1;
      let P = [linhaX, linhaY, linhaW];
      return multiplyMatricesJanela(tjv, P);
  }

  function janelaViewport(janela, viewport) {
      let Sx = (viewport.umax - viewport.umin) / (janela.xmax - janela.xmin);
      let Sy = (viewport.vmax - viewport.vmin) / (janela.ymax - janela.ymin);
      //let matrizparcial = [
      //    [Sx, 0, -1 * Sx * janela.xmin],
      //    [0, -Sy, -1 * Sy * janela.ymin],
      //    [0, 0, 1]
      //];
      let matrizNaoCentralizada= multiplyMatrices([[1, 0, viewport.umin], [0, 1, viewport.vmin], [0,0,1]],
          multiplyMatrices([[Sx, 0, 0], [0, Sy, 0], [0,0,1]],
                [[1, 0, -1*janela.xmin], [0, -1, -1*janela.ymin],[0,0,1]],
                ));
/*
      rj = (janela.xmax - janela.xmin) / (janela.ymax - janela.ymin);
      rv = (viewport.umax - viewport.umin) / (viewport.vmax - viewport.vmin);

      let matrizFinal;
      if (rj > rv) {
          let vmaxnovo = (viewport.umax - viewport.umin) / rj + viewport.vmin;
          //console.log(viewport.vmax, vmaxnovo)
          let mat1 = [
              [1, 0, 0],
              [0, 1, -1 * (viewport.vmax - vmaxnovo) / 2],
              [0, 0, 1]
          ];
          matrizCentralizada = multiplyMatrices(mat1, matrizNaoCentralizada);
      } else {
          let umaxnovo = rj * (viewport.vmax - viewport.vmin) + viewport.umin;
          //console.log(viewport.umax, umaxnovo)
          let mat1 = [
              [1, 0, -1 * (viewport.umax - umaxnovo)/2],
              [0, 1, 0],
              [0, 0, 1]
          ];
          matrizCentralizada = multiplyMatrices(mat1, matrizNaoCentralizada);
      }
*/
      //return matrizCentralizada;
	  return matrizNaoCentralizada;
  }

  function mostrar() {
      let normal = calculaNormal();
      let ds = calculaDs(normal, centro);
      let mp;
      if (cilindrica) {
          mp = montaMatrizPerspectivaCilindro(normal, centro, ds);
      } else {
          mp = montaMatrizPerspectivaCone(normal, centro, ds);
      }
      let canvas = document.getElementById("canvas");
      let tjv = janelaViewport({
		  //Professor
		  xmin: 3,
          xmax: 5,
          ymin: 3.6,
          ymax: 6
		  //Edu
          //xmin: 0,
          //xmax: 1000,
          //ymin: 0,
          //ymax: 600
      }, {
		  //Professor
		  umin: 0,
          umax: 640,
          vmin: 0,
          vmax: 480
		  //Edu
          //umin: 0,
          //umax: canvas.width,
          //vmin: 0,
          //vmax: canvas.height
      })
      let p = calculoP(mp, vertices, tjv);
      console.log(p)
      for (var i = 0; i < p[0].length; i++) {
          desenhaPonto({x: p[0][i], y: p[1][i]})
      }
  }

  //coloca valor nas variaveis do plano
  function putValuePontoPlano() {
      pPlano1 = {
          'x': $('[name=P1x]').val(),
          'y': $('[name=P1y]').val(),
          'z': $('[name=P1z]').val()
      }
      pPlano2 = {
          'x': $('[name=P2x]').val(),
          'y': $('[name=P2y]').val(),
          'z': $('[name=P2z]').val()
      }
      pPlano3 = {
          'x': $('[name=P3x]').val(),
          'y': $('[name=P3y]').val(),
          'z': $('[name=P3z]').val()
      }

      var valor = $("#select option:selected").val();
      if (valor == "outro") {
          pR = {
              'x': $('[name=Rx]').val(),
              'y': $('[name=Ry]').val(),
              'z': $('[name=Rz]').val()
          }
      } else {
          pR = {
              'x': $("[name=" + valor + "x]").val(),
              'y': $("[name=" + valor + "y]").val(),
              'z': $("[name=" + valor + "z]").val()
          }

      }
  }

  function Vertice(x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
  }

  function Superficie(vertices) {
      this.vertices = vertices;
  }

  //coloca valor nos campos vertices e superficies
  function putValueVerticesAndSuperficies() {
      vertices = [];
      tam = $('[name=numV]').val();
      var i = 1;
      $(".justAuxCatchVertice").each(function() {
          vertices.push(new Vertice($("[name=x" + i + "]").val(), $("[name=y" + i + "]").val(), $("[name=z" + i + "]").val()));
          i++;
      });

      i = 1;

      superficies = [];
      $(".justAuxCatchSuperficie").each(function() {
          var vertices2 = []
          var j = 1;
          $(".justAuxCatchSuperficie" + i).each(function() {
              vertices2.push($("#verticeS" + i + j + " option:selected").val());
              j++;
          });
          i++;
          superficies.push(vertices2);
      });
  }

  function putValuePontoDeVista() {
      centro = {
          'x': $('[name=x]').val(),
          'y': $('[name=y]').val(),
          'z': $('[name=z]').val()
      }
  }

  //animação para o proximo fieldset
  $(".next").click(function() {
      if (animating) return false;
      animating = true;

      current_fs = $(this).parent();
      next_fs = $(this).parent().next();

      //ativa o novo fieldset na barra de progresso
      $("#progressbar li").eq($(".especial").index(next_fs)).addClass("active");

      next_fs.show();
      current_fs.animate({
          opacity: 0
      }, {
          step: function(now, mx) {
              scale = 1 - (1 - now) * 0.2;
              left = (now * 50) + "%";
              opacity = 1 - now;
              current_fs.css({
                  'transform': 'scale(' + scale + ')',
                  'position': 'absolute'
              });
              next_fs.css({
                  'left': left,
                  'opacity': opacity
              });
          },
          duration: 800,
          complete: function() {
              current_fs.hide();
              animating = false;
          },
          easing: 'easeInOutBack'
      });
  });

  //animação para o fieldset anterior
  $(".previous").click(function() {
      if (animating) return false;
      animating = true;

      $(".next").attr("disabled", false);

      current_fs = $(this).parent();
      previous_fs = $(this).parent().prev();

      //volta a barra de progresso
      $("#progressbar li").eq($(".especial").index(current_fs)).removeClass("active");
      previous_fs.show();
      current_fs.animate({
          opacity: 0
      }, {
          step: function(now, mx) {
              scale = 0.8 + (1 - now) * 0.2;
              left = ((1 - now) * 50) + "%";
              opacity = 1 - now;
              current_fs.css({
                  'left': left
              });
              previous_fs.css({
                  'transform': 'scale(' + scale + ')',
                  'opacity': opacity
              });
          },
          duration: 800,
          complete: function() {
              current_fs.hide();
              animating = false;
          },
          easing: 'easeInOutBack'
      });
  });

  //valida o primeiro fieldset
  $(".numF").on("input", function() {
      if ($('[name=x]').val() == "" || $('[name=y]').val() == "" || $('[name=z]').val() == "") {
          $(".fieldset1").attr("disabled", true);
          $("[name=nextS1]").attr("disabled", true);
      } else {
          $(".fieldset1").attr("disabled", false);
          $("[name=nextS1]").attr("disabled", false);
      }
  });

  //mostra campos ou esconde dependendo da opção selecionada no selct da segunda fieldset
  $("#select").change(function() {
      if ($(this).val() == "outro") {
          $(".hideS").show();
          $("#erroCC").show();
          $(".fieldset2").attr("disabled", true);
          $("[name=nextS2]").attr("disabled", true);
      } else {
          $(".hideS").hide();
          $("#erroCC").hide();
          var P1x = $('[name=P1x]').val();
          var P1y = $('[name=P1y]').val();
          var P1z = $('[name=P1z]').val();
          var P2x = $('[name=P2x]').val();
          var P2y = $('[name=P2y]').val();
          var P2z = $('[name=P2z]').val();
          var P3x = $('[name=P3x]').val();
          var P3y = $('[name=P3y]').val();
          var P3z = $('[name=P3z]').val();
          if (P1x == "" || P1y == "" || P1z == "" || P2x == "" || P2y == "" || P2z == "" || P3x == "" || P3y == "" || P3z == "") {
              $(".fieldset2").attr("disabled", true);
              $("[name=nextS2]").attr("disabled", true);
          } else if (((P1x - P2x) * (P1y - P3y) - (P1y - P2y) * (P1x - P3x)) === 
					 ((P1y - P2y) * (P1z - P3z) - (P1z - P2z) * (P1y - P3y)) ===
					 ((P1x - P2x) * (P1z - P3z) - (P1z - P2z) * (P1x - P3x)) === 0) {
              $(".fieldset2").attr("disabled", true);
              $("[name=nextS2]").attr("disabled", true);
              $("#erroC").show();
          } else {
              $(".fieldset2").attr("disabled", false);
              $("[name=nextS2]").attr("disabled", false);
              $("#erroC").hide();
          }
      }
  });

  //valida o segundo fieldset
  $(".numS").on("input", function() {
      var block = false;
      var P1x = $('[name=P1x]').val();
      var P1y = $('[name=P1y]').val();
      var P1z = $('[name=P1z]').val();
      var P2x = $('[name=P2x]').val();
      var P2y = $('[name=P2y]').val();
      var P2z = $('[name=P2z]').val();
      var P3x = $('[name=P3x]').val();
      var P3y = $('[name=P3y]').val();
      var P3z = $('[name=P3z]').val();
      if (P1x == "" || P1y == "" || P1z == "" || P2x == "" || P2y == "" || P2z == "" || P3x == "" || P3y == "" || P3z == "") {
          $(".fieldset2").attr("disabled", true);
          $("[name=nextS2]").attr("disabled", true);
          block = true;
      } else if (((P1x - P2x) * (P1y - P3y) - (P1y - P2y) * (P1x - P3x)) === 
				 ((P1y - P2y) * (P1z - P3z) - (P1z - P2z) * (P1y - P3y)) ===
				 ((P1x - P2x) * (P1z - P3z) - (P1z - P2z) * (P1x - P3x)) === 0) {
          $(".fieldset2").attr("disabled", true);
          $("[name=nextS2]").attr("disabled", true);
          $("#erroC").show();
      } else {
          $(".fieldset2").attr("disabled", false);
          $("[name=nextS2]").attr("disabled", false);
          $("#erroC").hide();
      }

      if ($("#select").val() == "outro") {
          var Rx = $('[name=Rx]').val();
          var Ry = $('[name=Ry]').val();
          var Rz = $('[name=Rz]').val();
          if (Rx == "" || Ry == "" || Rz == "") {
              $(".fieldset2").attr("disabled", true);
              $("[name=nextS2]").attr("disabled", true);
              $("#erroCC").show();
              return;
          }
          if (block) {
              return;
          }
          var P1P2x = parseFloat(P2x) - parseFloat(P1x);
          var P1P2y = parseFloat(P2y) - parseFloat(P1y);
          var P1P2z = parseFloat(P2z) - parseFloat(P1z);
          var P1P3x = parseFloat(P3x) - parseFloat(P1x);
          var P1P3y = parseFloat(P3y) - parseFloat(P1y);
          var P1P3z = parseFloat(P3z) - parseFloat(P1z);
          var ni = P1P2y * P1P3z - P1P2z * P1P3y;
          var nj = P1P2z * P1P3x - P1P2x * P1P3z;
          var nk = P1P2x * P1P3y - P1P2y * P1P3x;
          var d = -(ni * P3x + nj * P3y + nk * P3z)
          if (Math.abs(ni * Rx + nj * Ry + nk * Rz + d) / Math.sqrt(Math.pow(ni, 2) + Math.pow(nj, 2) + Math.pow(nk, 2)) != 0) {
              $(".fieldset2").attr("disabled", true);
              $("[name=nextS2]").attr("disabled", true);
              $("#erroCC").show();
          } else {
              $(".fieldset2").attr("disabled", false);
              $("[name=nextS2]").attr("disabled", false);
              $("#erroCC").hide();
          }
      }
  });

  //gera campos para adicionar os valores dos vertices
  $('[name=numV]').on("input", function() {
      var tam = $('[name=numV]').val();
      if (tam == "" || tam <= 0) {
          for (var i = tamVL; i > 0; i--) {
              $("[name=p" + i + "]").remove();
          }
          tamVL = 0;
          $("[name=verticeS]").find('option').remove();
          ab = true;
          libera();
          return;
      }
      if (tam == tamVL) {
          return;
      }
      ab = false;
      if (tam > tamVL) {
          var auxTamVL = tamVL;
          tamVL = tam;
          for (var i = auxTamVL; i < tam; i++) {
              k = parseInt(1) + parseInt(i);
              $("[name=verticeS]").append(new Option("Vertice " + k, k));

              //area instavel (não gera erro mas se add algo tome cuidado), valida os campos distancia ponto do ultimo fieldset
              $('.inpV').removeClass('hidden').append(insertInputVertice(k)).on("input", function() {
                  var contador = 0;
                  $('.numLV').each(function() {
                      if ($(this).val() != "")
                          contador++;
                      else
                          return;
                  });
                  if (contador == tamVL * 3) {
                      bc = false;
                  } else {
                      bc = true;
                  }
                  libera();
              });
          }
          bc = true;
          libera();
      } else {
          for (var i = tamVL; i > tam; i--) {
              $("[name=verticeS] option[value=" + i + "]").remove();
              $("[name=p" + i + "]").remove();
          }
          tamVL = tam;
      }
      libera();
  });

  //gera campos para adicionar os numeros de vertices de uma superficie
  $('[name=numSL]').on("input", function() {
      var tam = $('[name=numSL]').val();
      if (tam == "" || tam <= 0) {
          for (var i = tamSL; i > 0; i--) {
              $("[name=s" + i + "]").remove();
          }
          tamSL = 0;
          cd = true;
          libera();
          return;
      }
      if (tam == tamSL) {
          return;
      }
      cd = false;
      if (tam > tamSL) {
          for (var i = tamSL; i < tam; i++) {
              const k = parseInt(1) + parseInt(i);

              //area instavel (não gera erro mas se add algo tome cuidado), valida os campos número de vertices do ultimo fieldset		
              $('.inpS').removeClass('hidden').append(insertInputSuperfice(k)).on("input", function() {
                  var tam = $("[name=Superficie" + k + "]").val();
                  var tamAux = $(".inpS" + k).children("div").size();
                  if (tam == "" || tam <= 0) {
                      $(".next").attr("disabled", true);
                      for (var j = tamAux; j > 0; j--) {
                          $("[name=V" + k + j + "]").remove();
                      }
                      de = true;
                      libera();
                      return;
                  }

                  if (tam == tamAux) {
                      return;
                  }
                  if (tam > tamAux) {
                      for (var j = tamAux + 1; j <= tam; j++) {
                          $(".inpS" + k).removeClass('hidden').append(insertInputVetice(k, j))
                          for (var mi = 1; mi <= tamVL; mi++) {
                              $("[name=V" + k + j + "]").children("[name=verticeS]").append(new Option("Vertice " + mi, mi));
                          }
                      }
                  } else {
                      for (var j = tamAux; j > tam; j--) {
                          $("[name=V" + k + j + "]").remove();
                      }
                  }

                  var contador = 0;
                  $('.numLS').each(function() {
                      if ($(this).val() != "" && $(this).val() >= 0)
                          contador++;
                      else
                          return;
                  });
                  if (contador == tamSL) {
                      de = false;
                  } else {
                      de = true;
                  }
                  libera();

              });

          }
          de = true;
          libera();
          tamSL = tam;
      } else {
          for (var i = tamSL; i > tam; i--) {
              $("[name=s" + i + "]").remove();
          }
          tamSL = tam;
      }
      libera();
  });

  var insertInputVetice = function(i, num) {
      return (
          "<div class='justAuxCatchSuperficie" + i + "' name='V" + i + num + "'>" +
          "<select name='verticeS' id='verticeS" + i + num + "' />" +
          "</div>");
  }

  var insertInputSuperfice = function(num) {
      return (
          "<div name='s" + num + "'>" +
          "<h4 class='fs-P'>Superficie " + num + "</h4>" +
          "<input type='number' name='Superficie" + num + "' class='numLS justAuxCatchSuperficie' placeholder='Número de Vertices na Superficie " + num + "' />" + "<div class='hidden inpS" + num + "'></div>" +
          "</div>");
  }

  var insertInputVertice = function(num) {
      return (
          "<div class='justAuxCatchVertice' name='p" + num + "'>" +
          "<h4 class='fs-P'>Valores do vertice " + num + "</h4>" +
          "<input type='number' name='x" + num + "' class='numLV' placeholder='Distância x' />" +
          "<input type='number' name='y" + num + "' class='numLV' placeholder='Distância y' />" +
          "<input type='number' name='z" + num + "' class='numLV'  placeholder='Distância z' />" +
          "</div>");
  }

  function libera() {
      if (ab | bc | cd | de) {
          $(".submit").attr("disabled", true);
          $("[name=nextS3]").attr("disabled", true);
      } else {
          $(".submit").attr("disabled", false);
          $("[name=nextS3]").attr("disabled", false);
      }
  }
  
  $(".menu-submenu").on('click', function(e){
	        var selected = $(this);
			var submenu = $(this).next("li");
	        if( $(submenu).is(":hidden")) {
				submenu.show();
				selected.addClass('submenu-open');
	        }else{
				submenu.hide();
				selected.removeClass('submenu-open');
			}
			e.stopPropagation();
	    });

  //botao de submit
  $(".submit").click(function() {
      putValuePontoDeVista()
      putValuePontoPlano();
      putValueVerticesAndSuperficies();
      $("#progressbar").hide();
      $(".especial").hide();
      $(".next").hide();
      $(".previous").hide();
      $(".submit").hide();
	  $(".list").hide();
	  $("form").css("margin", "0 auto");
	  //Professor
	  $("#canvas").css('width', 640);
	  $("#canvas").css('height', 480);
	  document.getElementById("canvas").width = 640;
	  document.getElementById("canvas").height = 480;
	  //Charles
	  //$("#canvas").css('width', window.innerWidth - 250);
	  //$("#canvas").css('height', window.innerHeight - 50);
	  //document.getElementById("canvas").width = window.innerWidth - 250;
	  //document.getElementById("canvas").height = window.innerHeight - 50;
	  $(".menu").show();
      $("#canvas").show();
      mostrar();
  });

  //mostra novamente a primeira tela
  function mostrarNovamentePrimeiraTela() {
	  $("form").css("margin", "50px auto")
      $(".etapa1").show();
      $("[name=nextS1]").show();
      $(".etapa1").animate({
          opacity: 100
      }, {
          step: function(now, mx) {
              $(".etapa1").css({
                  'transform': 'scale(' + scale + ')',
                  'opacity': opacity
              });
          },
          easing: 'easeInOutBack'
      });
  }

  function mostrarNovamenteSegundaTela() {
	  $("form").css("margin", "50px auto")
      $(".etapa2").show();
      $("[name=nextS2]").show();
      $(".etapa2").animate({
          opacity: 100
      }, {
          step: function(now, mx) {
              $(".etapa2").css({
                  'transform': 'scale(' + scale + ')',
                  'opacity': opacity
              });
          },
          easing: 'easeInOutBack'
      });
  }

  function mostrarNovamenteTerceiraTela() {
	  $("form").css("margin", "50px auto")
      $(".etapa3").show();
      $("[name=nextS3]").show();
      $(".etapa3").animate({
          opacity: 100
      }, {
          step: function(now, mx) {
              $(".etapa3").css({
                  'transform': 'scale(' + scale + ')',
                  'opacity': opacity
              });
          },
          easing: 'easeInOutBack'
      });
  }

  $("[name=nextS1]").click(function() {
      putValuePontoDeVista()
	  $("form").css("margin", "0 auto");
	$(".menu").show();
      $(".especial").hide();
      $("#canvas").show();
      mostrar();
  });

  $("[name=nextS2]").click(function() {
      putValuePontoPlano();
	  $("form").css("margin", "0 auto");
	$(".menu").show();
      $(".especial").hide();
      $("#canvas").show();
      mostrar();
  });

  $("[name=nextS3]").click(function() {
      putValueVerticesAndSuperficies();
	  $("form").css("margin", "0 auto");
	$(".menu").show();
      $(".especial").hide();
      $("#canvas").show();
      mostrar();
  });
  
  $("[name=sDadosCena]").change(function() {
	var valor = $(this).val();
	if(valor != ""){
		$("#canvas").hide();
		$(".menu").hide();
		if(valor == 1){
		mostrarNovamentePrimeiraTela();
	}
	else if(valor == 2){
		mostrarNovamenteSegundaTela();
	}
	else if(valor == 3){
		mostrarNovamenteTerceiraTela();
	}
	$("[name=sDadosCena] option")[0].selected = true;
	}
  });
  
  $("[name=sTipoDeProjecao]").change(function() {
	if($(this).val() == 1){
		cilindrica = false;
	} else{
		cilindrica = true;
	}
	mostrar();
  });