"use strict";

function dice_initialize(container) {
    $t.remove($t.id('loading_text'));

    var canvas = $t.id('canvas');
    canvas.style.width = window.innerWidth - 1 + 'px';
    canvas.style.height = window.innerHeight - 101 + 'px';
    var label = $t.id('label');
    var set = $t.id('set');
    var regularPool = $t.id('regular_pool');
    var bloodPool = $t.id('blood_pool');
    var bloodInfo = $t.id('blood-info');
    var regularInfo = $t.id('regular-info');
    var selector_div = $t.id('selector_div');
    var info_div = $t.id('info_div');

    const latestElement = $t.id('latest-roll');
    const previousElement = $t.id('previous-roll');

    $t.dice.use_true_random = false;

    $t.bind(regularPool, 'input', function(ev) {
      const word = (ev.target.value == '1') ? 'regular die' : 'regular dice';
      regularInfo.innerHTML = ev.target.value + ' ' + word;
    });
    $t.bind(bloodPool, 'input', function(ev) {
      const word = (ev.target.value == '1') ? 'blood die' : 'blood dice';
      bloodInfo.innerHTML = ev.target.value + ' ' + word;
    });

    var params = $t.get_url_params();

    var box = new $t.dice.dice_box(canvas, { w: 500, h: 300 });
    box.animate_selector = false;

    $t.bind(window, 'resize', function() {
        canvas.style.top = '100px';
        canvas.style.width = window.innerWidth - 1 + 'px';
        canvas.style.height = window.innerHeight - 1 + 'px';
        box.reinit(canvas, { w: 500, h: 300 });
    });

    function before_roll(vectors, notation, callback) {
        previousElement.innerHTML = latestElement.innerHTML;
        latestElement.innerHTML = 'rolling';
        callback();
    }

    function notation_getter() {
        return $t.dice.parse_notation(regularPool.value, bloodPool.value);
    }

    function after_roll(notation, result) {
      let simpleAnkhs = 0;
      let hungerDoubleAnkhs = 0;
      let regularDoubleAnhks = 0;
      let bestialFailureCandidate = false;
      result.forEach((roll, i) => {
        const isBlood = i >= notation.set.length;
        if (6 <=  roll && roll <= 9) {
          simpleAnkhs += 1;
        }
        if (isBlood && roll == 1) {
          bestialFailureCandidate = true;
        }
        if (roll == 0) {
          if (isBlood) {
            hungerDoubleAnkhs += 1;
          } else {
            regularDoubleAnhks += 1;
          }
        }
      });
      const doubleAnkhs = regularDoubleAnhks + hungerDoubleAnkhs;
      const successes = simpleAnkhs + 4 * parseInt(doubleAnkhs / 2) + (doubleAnkhs % 2);
      const critical = parseInt(doubleAnkhs / 2);
      const messyCritical = critical && (hungerDoubleAnkhs > 0);
      const besitalFailure = (successes == 0 && bestialFailureCandidate);
      console.log({
        successes: successes,
        critical: critical,
        messyCritical: messyCritical,
        besitalFailure: besitalFailure,
      });

      // Update interface.
      let newHtml = '';
      if (successes > 0) {
        newHtml += `${successes} success`;
        if (successes > 1) { newHtml += 'es'; }
        if (messyCritical) {
          newHtml += ', <span class="messy-critical critical">messy critical</span>'
        } else if (critical) {
          newHtml += ', <span class="critical">critical</span>'
        }
      } else {
        if (besitalFailure) {
          newHtml += '<span class="bestial-failure failure">bestial failure</span>';
        } else {
          newHtml += '<span class="failure">failure</span>';
        }
      }

      latestElement.innerHTML = newHtml;
    }

    box.bind_mouse(container, notation_getter, before_roll, after_roll);
    box.bind_throw($t.id('throw'), notation_getter, before_roll, after_roll);


    // if (params.roll) {
        $t.raise_event($t.id('throw'), 'mouseup');
    // }
}
