$(function(){
    var nameList1 = [
      '현명한', '시끄러운', '인색한', '영리한', '재빠른', '무심한', '귀여운', '느긋한', '유쾌한'
    ];
    var nameList2 = [
      '토끼', '사자', '거북이', '청새치', '상어', '호랑이', '사슴'
    ]

    const chatLog = document.querySelector('#chatLogs');
    const errorMsg = $('.error-msg');
    const errorImg = $('.error-img');

    chatLog.addEventListener('DOMSubtreeModified', function() {
      chatLog.scrollTop = chatLog.scrollHeight - chatLog.clientHeight;
    }, false);

    const name = makeRandomName();
    // socket.io 서버에 접속한다
    var socket = io();

    // 서버로 자신의 정보를 전송한다.
    socket.emit("login", {
      name: name
    });

    // 서버로부터의 메시지가 수신되면
    socket.on("login", function(data) {
      $("#chatLogs").append("<div><strong>" + data.name + "</strong> 님이 참가하였습니다.</div>");
      $('#numUser').text('현재 접속자 수: ' + data.numUser + '명');
    });

    // 서버로부터의 메시지가 수신되면
    socket.on("chat", function(data) {
      $("#chatLogs").append("<div>" + '<strong>' + data.from.name + '</strong>' +" : " +data.msg+"</div>");
    });

    // 서버로부터의 이미지가 수신되면
    socket.on("imgChat", function(data) {
        console.log(data.img);
        $('#imgLogs').append("<div class='msg mb-3'>" + '<strong>' + data.from.name + ' :' + '</strong>' + '</div>'
            + "<img src=" + "\"" +  URL.createObjectURL(data.img) + "\"" + "class=\"img-msg\">");
    })
    
    // 다른 유저가 나갔을 때
    socket.on("disconnetUser", function(data) {
      $('#chatLogs').append("<div>" + '<strong>' + data.name + '</strong>' + ' 님이 나갔습니다.' + '</div>');
      $('#numUser').text('현재 접속자 수: ' + data.numUser + '명');
    })

    // Message 전송 버튼이 클릭되면
    $(".chat-form").submit(function(e) {
      e.preventDefault();
      var $msgForm = $("#msgForm");
      var val = $msgForm.val();
      val = val.replace(/^\s*/, "");
      if (val.length > 100) val = val.slice(0,100);
      else if (val.length === 0) {
        $msgForm.addClass('shake error-field');
        errorMsg.css('visibility', 'visible');
        errorMsg.addClass('shake');
        setTimeout(() => {
          errorMsg.removeClass('shake');
          $msgForm.removeClass('shake');
        }, 500);
        return;
      }
      errorMsg.css('visibility', 'hidden');
      $msgForm.removeClass('error-field');
      // 서버로 메시지를 전송한다.
      socket.emit("chat", { msg: val});
      $("#chatLogs").append("<div class='msg'>" + '<strong>' + name + '(나)' + '</strong> : ' + val + '</div>');
      $msgForm.val("");
    });

    // 이미지 전송 버튼이 클릭되면
    $(".img-form").submit(function(e) {
        e.preventDefault();
        var $imgForm = $('#imgForm');
        var val = $imgForm[0].files
        console.log(val[0]);
        if (val.length === 0) {
            $imgForm.addClass('shake error-field');
            errorImg.css('visibility', 'visible');
            errorImg.addClass('shake');

            setTimeout(() => {
                $imgForm.removeClass('shake error-field');
                errorImg.removeClass('shake');
            }, 1000);
            return;
        }
        errorImg.css('visibility', 'hidden');
        // 서버로 사진을 전송한다.
        socket.emit("imgChat", val[0]);
        $('#imgLogs').append("<div class='msg mb-3'>" + '<strong>' + name + '(나) :' + '</strong>' + '</div>'
            + "<img src=" + "\"" +  URL.createObjectURL(val[0]) + "\"" + "class=\"img-msg\">");
    })

    function makeRandomName(){
      var name = "";
        name += nameList1[(Math.floor(Math.random() * nameList1.length))];
        name += ' ';
        name += nameList2[(Math.floor(Math.random() * nameList2.length))];
      return name;
    }
  });