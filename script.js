
function calculaNormal(ponto1, ponto2, ponto3){
    let nx= ((ponto1.y - ponto2.y) * (ponto3.z - ponto2.z)) - ((ponto3.y - ponto2.y) * (ponto1.z - ponto2.z))
    let ny= -1 * ((ponto1.x - ponto2.x) * (ponto3.z - ponto2.z)) - ((ponto3.x - ponto2.x) * (ponto1.z - ponto2.z))
    let nz= ((ponto1.x - ponto2.x) * (ponto3.y - ponto2.y)) - ((ponto3.x - ponto2.x) * (ponto1.y - ponto2.y))
    return {
      x: nx,
      y: ny,
      z: nz
    }
  }
  
  function calculaDs(ponto, normal, centro) {
    let d0 = ponto.x * normal.x + ponto.y * normal.y + ponto.z * normal.z
    let d1 = centro.x * normal.x + centro.y * normal.y + centro.z * normal.z
    let d = d0 - d1
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
  
  function montaMatrizPerspectivaCone(normal, centro, ds){
      m= [[ds.d + centro.x * normal.x, centro.x * normal.y, centro.x * normal.z, -1 * centro.x * ds.d0], [centro.y * normal.x, ds.d + centro.y * normal.y, centro.y * normal.z, -1 * centro.y * ds.d0], [centro.z * normal.x, centro.z * normal.y, ds.d + centro.z * normal.z, -1 * centro.z * ds.d0], [normal.x, normal.y, normal.z, -1* ds.d1]]
    return m
  }
  
  function montaMatrizPerspectivaCilindro(normal, centro, ds){
      m= [[ds.d - centro.x * normal.x, -1 * centro.x * normal.y, -1 * centro.x * normal.z, centro.x * ds.d0], [-1 * centro.y * normal.x, ds.d - centro.y * normal.y, -1 * centro.y * normal.z, centro.y * ds.d0], [-1 * centro.z * normal.x, -1 * centro.z * normal.y, ds.d - centro.z * normal.z, centro.z * ds.d0], [0, 0, 0, ds.d1]]
    return m
  }
  
  function calculoP(mp, objeto, tjv){
      let ph= multiplyMatrices(mp, objeto)
      let xc= ph[0][0]/ph[3][0]
    let yc= ph[1][0]/ph[3][0]
    let zc= ph[2][0]/ph[3][0]
    let wc= 1
      let temp= [[xc], [yc], [zc]]
    return multiplyMatrices(tjv, temp)
  }
  
  function janelaViewport(janela, viewport){
      let Sx= (viewport.umax - viewport.umin)/(janela.xmax - janela.xmin)
    let Sy= (viewport.vmax - viewport.vmin)/(janela.ymax - janela.ymin)
    let matrizparcial= [[Sx, 0, viewport.umin - Sx*janela.xmin], [0, -1 * Sy, viewport.vmin - Sy*janela.ymin], [0, 0, 1]]
    
    rj= (janela.xmax - janela.xmin)/(janela.ymax - janela.ymin)
    rv= (viewport.umax - viewport.umin)/(viewport.vmax - viewport.vmin)
    
    let matrizFinal
    if(rj > rv){
        let vmaxnovo= (viewport.umax- viewport.umin)/rj + viewport.vmin
      let mat1= [[1, 0, 0],[0, 1, (viewport.vmax - vmaxnovo)/2], [0, 0, 1]]
          matrizFinal= multiplyMatrices(matrizparcial, mat1)
    }else{
        let umaxnovo= rj*(viewport.vmax - viewport.vmin) + viewport.umin
          let mat1= [[1, 0, viewport.umax - umaxnovo], [0, 1, 0], [0, 0, 1]]
      matrizFinal= multiplyMatrices(matrizparcial, mat1)
    }
    
    return matrizFinal
  }


  var current_fs, next_fs, previous_fs;
  var left, opacity, scale;
  var animating;
  var fi = true;
  var tamVL = 0;
  var tamSL = 0;
  var ab=true,bc=true,cd=true,de=true;
  
  
  //animação para o proximo fieldset
  $(".next").click(function() {
    if (animating) return false;
    animating = true;
      
    if(fi==true){
        $("#erroC").hide();
      $(".hideS").hide();
      $("#erroCC").hide();
      fi = false;
      $(".submit").attr("disabled", true);
    }
  
    current_fs = $(this).parent();
    next_fs = $(this).parent().next();
  
    //ativa o novo fieldset na barra de progresso
    $("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");
  
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
    $("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");
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
  
  
  
  //
  
  //
  
  
  //valida o primeiro fieldset
  $(".numF").on("input",function() {
    if($('[name=x]').val() == "" || $('[name=y]').val() == "" || $('[name=z]').val() == ""){
          $(".fieldset1").attr("disabled", true);
    } else{
        $(".fieldset1").attr("disabled", false);
    }
  });
  
  
  //mostra campos ou esconde dependendo da opção selecionada no selct da segunda fieldset
  $("#select").change(function() {
      if($(this).val() == "outro"){
        $(".hideS").show();
      $("#erroCC").show();
      $(".fieldset2").attr("disabled", true);
    }else{
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
    if(P1x == "" || P1y == "" || P1z == "" || P2x == "" || P2y == "" || P2z == "" || P3x == "" || P3y == "" || P3z == ""){
          $(".fieldset2").attr("disabled", true);
    }
    else if(P1x*P2y*P3z + P1y*P2z*P3x + P1z*P2x*P3y - P1y*P2x*P3z -P1x*P2z*P3y - P1z*P2y*P3x == 0 ) {
        $(".fieldset2").attr("disabled", true);
      $("#erroC").show();
    }
    else{
        $(".fieldset2").attr("disabled", false);
      $("#erroC").hide();
    }
  }
    });
  
  
  //valida o segundo fieldset
  $(".numS").on("input",function() {
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
    if(P1x == "" || P1y == "" || P1z == "" || P2x == "" || P2y == "" || P2z == "" || P3x == "" || P3y == "" || P3z == ""){
          $(".fieldset2").attr("disabled", true);
      block = true;
    }
    else if(P1x*P2y*P3z + P1y*P2z*P3x + P1z*P2x*P3y - P1y*P2x*P3z -P1x*P2z*P3y - P1z*P2y*P3x == 0 ) {
        $(".fieldset2").attr("disabled", true);
      $("#erroC").show();
    }else{
        $(".fieldset2").attr("disabled", false);
      $("#erroC").hide();
     }
    
    if($("#select").val() == "outro"){
    var Rx = $('[name=Rx]').val();
      var Ry = $('[name=Ry]').val();
      var Rz = $('[name=Rz]').val();
    if(Rx == "" || Ry == "" || Rz == ""){
        $(".fieldset2").attr("disabled", true);
      $("#erroCC").show();
      return;
    }
    if(block){
    return;
    }
    var P1P2x =  parseFloat(P2x) - parseFloat(P1x);
    var P1P2y =  parseFloat(P2y) - parseFloat(P1y);
    var P1P2z =  parseFloat(P2z) - parseFloat(P1z);
    var P1P3x =  parseFloat(P3x) - parseFloat(P1x);
    var P1P3y =  parseFloat(P3y) - parseFloat(P1y);
    var P1P3z =  parseFloat(P3z) - parseFloat(P1z);
    var ni = P1P2y*P1P3z - P1P2z*P1P3y;
    var nj = P1P2z*P1P3x - P1P2x*P1P3z;
    var nk = P1P2x*P1P3y - P1P2y*P1P3x;
    var d = -(ni*P3x + nj*P3y + nk*P3z)
    if(Math.abs(ni*Rx+nj*Ry+nk*Rz+d)/Math.sqrt(Math.pow(ni,2) + Math.pow(nj,2) + Math.pow(nk,2)) != 0){
    $(".fieldset2").attr("disabled", true);
      $("#erroCC").show();
    }
    else{
        $(".fieldset2").attr("disabled", false);
      $("#erroCC").hide();
    }
    
    }
  });
  
  
  //gera campos para adicionar os valores dos vertices
  $('[name=numV]').on("input",function() {
      var tam = $('[name=numV]').val();
      if(tam == "" || tam <= 0){
      for (var i = tamVL; i > 0;i--) {
          $("[name=p"+i+"]").remove();
          }
          tamVL = 0;
          $("[name=verticeS]").find('option').remove();
          ab = true;
          libera();
          return;
      }
      if(tam == tamVL){
          return;
      }
      ab = false;
      if(tam > tamVL){
      var auxTamVL = tamVL;
      tamVL = tam;
          for (var i = auxTamVL; i < tam;i++) {
          k = parseInt(1) + parseInt(i);
          $("[name=verticeS]").append(new Option("Vertice "+k, k));
          
  //area instavel (não gera erro mas se add algo tome cuidado), valida os campos distancia ponto do ultimo fieldset
      $('.inpV').removeClass('hidden').append(insertInputVertice(k)).on("input",function() {
  var contador = 0;
      $('.numLV').each(function() {
          if($(this).val()!="")
              contador++;
          else
              return;
      });
      if(contador == tamVL*3){
          bc = false;
      }else{
      bc = true;
      }
      libera();
  });
          }
          bc = true;
          libera();
      }else{
          for (var i = tamVL; i > tam;i--) {
          $("[name=verticeS] option[value="+i+"]").remove();
          $("[name=p"+i+"]").remove();
          }
          tamVL = tam;
      }
      libera();
  });
  
  
  //gera campos para adicionar os numeros de vertices de uma superficie
  $('[name=numSL]').on("input",function() {
      var tam = $('[name=numSL]').val();
      if(tam == "" || tam <= 0){
      for (var i = tamSL; i > 0;i--) {
          $("[name=s"+i+"]").remove();
          }
          tamSL = 0;
          cd = true;
          libera();
          return;
      }
      if(tam == tamSL){
          return;
      }
      cd = false;
      if(tam > tamSL){
          for (var i = tamSL; i < tam;i++) {
          const k = parseInt(1) + parseInt(i);
          
  //area instavel (não gera erro mas se add algo tome cuidado), valida os campos número de vertices do ultimo fieldset		
          $('.inpS').removeClass('hidden').append(insertInputSuperfice(k)).on("input",function() {	
          var tam = $("[name=Superficie"+k+"]").val();
          var tamAux=$(".inpS"+k).children("div").size();
          if(tam == "" || tam <= 0){
              $(".next").attr("disabled", true);
              for (var j = tamAux; j > 0;j--) {
                  $("[name=V"+k+j+"]").remove();
          }
          de = true;
      libera();
          return;
          }
          
          if(tam == tamAux){
          return;
      }
      if(tam > tamAux){
          for (var j = tamAux+1; j <= tam;j++) {
      $(".inpS"+k).removeClass('hidden').append(insertInputVetice(k,j))
      for (var mi = 1; mi <= tamVL;mi++) {
          $("[name=V"+k+j+"]").children("[name=verticeS]").append(new Option("Vertice "+mi, mi));
          }
          }
          }
          else{
          for (var j = tamAux; j > tam;j--) {
          $("[name=V"+k+j+"]").remove();
          }
      }
      
      var contador = 0;
      $('.numLS').each(function() {
          if($(this).val()!="" && $(this).val()>=0)
              contador++;
          else
              return;
      });
      if(contador == tamSL){
          de = false;
      }else{
      de = true;
      }
      libera();
      
          });
          
          }
          de = true;
          libera();
          tamSL = tam;
      }else{
          for (var i = tamSL; i > tam;i--) {
          $("[name=s"+i+"]").remove();
          }
          tamSL = tam;
      }
      libera();
  });
  
  var insertInputVetice = function(i,num){
  return (
              "<div name='V"+i+num+"'>"+
          "<select name='verticeS' />"+
                  "</div>");
  }
  
  var insertInputSuperfice = function(num){
  return (
              "<div name='s"+num+"'>"+
              "<h4 class='fs-P'>Superficie "+num+"</h4>"+
          "<input type='number' name='Superficie"+num+"' class='numLS' placeholder='Número de Vertices na Superficie "+num+"' />"+"<div class='hidden inpS"+num+"'></div>"+
                  "</div>");
  }
  
  var insertInputVertice = function(num) {
        return (
              "<div name='p"+num+"'>"+
              "<h4 class='fs-P'>Valores do vertice "+num+"</h4>"+
          "<input type='number' name='x"+num+"' class='numLV' placeholder='Distância x' />"+
          "<input type='number' name='y"+num+"' class='numLV' placeholder='Distância y' />"+
          "<input type='number' name='z"+num+"' class='numLV'  placeholder='Distância z' />"+
                  "</div>");
      }
  
  function libera(){
      if(ab|bc|cd|de){
          $(".submit").attr("disabled", true);
      }else{
          $(".submit").attr("disabled", false);
      }
  }
  
  //botao de submit
  $(".submit").click(function() {
      alert( "Tudo Ok" );
    return false;
  })