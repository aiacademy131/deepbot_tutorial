window.onload = function() {
    // 메시지 변수 생성
    var mode        = 0 // 0: TEXT 1: MIC
    var message     = ""
    var messagetmp  = ""

    var synthesis   = init_synthesis()
    var utterance   = init_utterance()
    var recognition = init_recognition()

    function init_synthesis() {
        var synthesis = window.speechSynthesis
        return synthesis
    }
    function init_utterance() {
      var utterance = new SpeechSynthesisUtterance()
      utterance.text = message
      utterance.lang = 'ko-KR' // 언어 지정; 영어 -> 'en-US'
      // utterance.lang = 'en-US' // 언어 지정; 영어 -> 'en-US'
      utterance.volume = "1" // 소리 크기 값; 최소값: 0, 최댓값: 1
      utterance.pitch = "1" // 음높이, 음의 고저의 정도; 최솟값: 0, 최댓값: 2
      utterance.rate = "1" // 속도; 최솟값: 0.1, 최댓값: 10
      return utterance
    }
    function init_recognition() {
      var recognition = new(window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition)()
      recognition.lang = 'ko-KR' // 언어 지정; 영어 -> 'en-US'
      recognition.interimResults = false // 음성인식 중간에 결과를 반환할지 여부
      recognition.continuous = false // 음성인식에 대해 연속 결과를 반환할지 여부
      recognition.maxAlternatives = 1 // 음성인식 결과 최대 수; 기본 값: 1
      return recognition
    }

    // 음성인식 이벤트 처리
    recognition.onresult = function(event) {
        var current = event.resultIndex
        var transcript = event.results[current][0].transcript

        // 음성의 반복되는 버그를 잡기 위함 (수정하지 않는 것을 추천)
        var repeatBug = (current == 1 && transcript == event.results[0][0].transcript)
        if (!repeatBug) {
            messagetmp += transcript
        }
        submitMessage(messagetmp)
    }
    recognition.onend = function() {
        if(messagetmp === "") {
          if(mode == 1) {
            $('#mic').removeClass('btn-primary')
            $('#mic').addClass('btn-light')
          }
        }
    }
    utterance.onend = function() {
      messagetmp = ''
      if(mode == 1) {
          recognition.start()
      }
    }

    // 사용자 UI 이벤트 처리
    init_ui_events()

    function init_ui_events() {
      init_submit_event()
      init_mic_event()
    }
    function init_submit_event() {
      $("#submit").on('submit', function(e) {
        e.preventDefault();

        var input = $(this).find('input[type=text]');
        var message = input.val();

        message = $.trim(message);

        if (message) {
            submitMessage(message);
            input.val('');
        } else {
            input.focus();
        }
      })
    }
    function init_mic_event() {
      $('#mic').on('click', function(event) {
          var flag = $('#mic').hasClass('btn-primary')

          if(flag) {
            mode = 0
            $('#mic').removeClass('btn-primary')
            $('#mic').addClass('btn-light')
          } else {
            mode = 1
            $('#mic').removeClass('btn-light')
            $('#mic').addClass('btn-primary')

            messagetmp = ''
            if (messagetmp.length) {
                messagetmp += ' '
            }
            recognition.start()
          }
      })
    }

    // 메시지 전송 유틸
    function submitMessage(msg) {
      var type = 'outgoing-message'
      add_message(msg, type)

      $.ajax({
          url: '/message',
          type: 'POST',
          dataType: 'json',
          contentType: 'application/json',
          data: JSON.stringify({ message: msg }),
          success: function(res) {
              try {
                message   = res.message
                add_message(message)

                utterance.text = message
                synthesis.speak(utterance)
              } catch(e) {
                utterance.text = "이해를 하지 못했어요."
                synthesis.speak(utterance)
              }
          }
      })
    }
    function add_message(message, type) {
        var chat_body = $('.layout .content .chat .chat-body');
        if (chat_body.length > 0) {

            type = type ? type : '';
            message = message ? message : '안녕하세요.';

            $('.layout .content .chat .chat-body .messages').append('<div class="message-item ' + type + '"><div class="message-content">' + message + '</div><div class="message-action">PM 14:25 ' + (type ? '<i class="ti-check"></i>' : '') + '</div></div>');

            chat_body.scrollTop(chat_body.get(0).scrollHeight, -1).niceScroll({
                cursorcolor: 'rgba(66, 66, 66, 0.20)',
                cursorwidth: "4px",
                cursorborder: '0px'
            }).resize();
        }
    }
}
