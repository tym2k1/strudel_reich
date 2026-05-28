// @title Electric Counterpoint
// @by Steve Reich
// @details Strudel implementation by Tymoteusz Burak (tym2k1)
//          Backing tracks to be played alongside with a live guitar
//          Composition rights belong to original composer/publisher

// Force reload on whole file re-evaluation
clearScope()

let maxGain = .4 // gain

// time variance between notes for more liveliness
// scaled to 8-notes so note might appear ♪/desyncScale early/late
let desyncScale = 32

const colors = [
'#292f56',
'#223f6b',
'#09507f',
'#006290',
'#007498',
'#00859e',
'#0097a3',
'#00a9a4',
'#00bca1',
'#00cf97',
'#43df8b',
'#7aed7d',
'#acfa70',
]

// This produces
// [tonal] error: invalid scale step "~", expected number or integer with optional # b suffixes
// probably due to using `~` in forEach instead of "~" but it works anyway
// "~" doesnt work cause `m is not a function`
// ¯\(ツ)/¯
Array.prototype.genFadeInFadeOut = function (notesPerBar = 8) {
  const sequence = [];

  this.forEach(m => {
    // const total = m.offset + m.fadeIn + m.hold + m.fadeOut;
    // console.log('total:', total, 'offset:', m.offset, 'fadeIn:', m.fadeIn, 'hold:', m.hold, 'fadeOut:', m.fadeOut)

    // offset
    for (let i = 0; i < m.offset; i++) {
      sequence.push({
        note: '~',
        gain: 0,
        scale: '~'
      });
    }

    // notes
    for (let i = 0; i < m.fadeIn; i++) {
      sequence.push({
        note: m.scaleNote,
        gain: (i / m.fadeIn),
        scale: m.scale
      });
    }
    for (let i = 0; i < m.hold; i++) {
      sequence.push({
        note: m.scaleNote,
        gain: 1,
        scale: m.scale
      });
    }
    for (let i = 0; i < m.fadeOut; i++) {
      sequence.push({
        note: m.scaleNote,
        gain: ((m.fadeOut - i) / m.fadeOut),
        scale: m.scale
      });
    }
  });

  // split into bars
  const bars = [];

  for (let i = 0; i < sequence.length; i += notesPerBar) {
    const chunk = sequence.slice(i, i + notesPerBar);

    while (chunk.length < notesPerBar) {
      chunk.push({ note: "~", gain: 0, scale: "~" });
    }

    const notes = chunk.map(e => e.note);
    const gains = chunk.map(e => e.gain);
    const scales = chunk.map(e => e.scale);

    bars.push([1, seq(notes).scale(seq(scales)).gain(seq(gains))]);
  }

  return bars;
};

// at the time of writing this there's no rot func in strudel (like one in tidal cycles)
// early is used here but the rotation is still applied forward
// sadly we have to specify pulses by hand
const rot = (steps, pulses) =>
  p => p.early(steps / pulses)

const guitar = (pattern) =>
     pattern
    .note()
    .postgain(perlin.range(0.95,1.05)) // Add some dynamics so it feels more live
    .postgain(maxGain)
    .spectrum()

// A “electric guitar” subclass
const electricGuitar = (pattern) =>
     guitar(pattern)
    .transpose(-12) // Most recordings seem to have the guitar tracks shifted an octave down and it does sound nicer
    .sound('gm_acoustic_guitar_nylon')
    .room(.6)

// A “bass guitar” subclass
const bassGuitar = (pattern) =>
     guitar(pattern)
    .sound("gm_acoustic_bass")
    // .postgain(.2)

// ----- FAST 1 -----

const fast_1_arrangeKeys = ["E4:Minor", "C5:Minor", "E4:Minor", "C5:Minor", "E4:Minor"]


// This motiff is shared. The first 6 eighnotes of a bar always are the same just scaled down on scale
// But the resting last 2 eightnotes aren't
// We apply thus different scale transpositions with
// .scaleTranspose("<transpose of first six eighnotes of a bar>!6 <transpose of last two eighnotes of a bar>!2")
const fast_1_motiff = " \
  0 0  1 0 -2 ~ 0 0 \
  0 -2 ~ 0 -2 ~ 0 0 \
  0 0  1 0 -2 ~ 0 0 \
  0 ~  ~ 0 -2 ~ 0 0 \
  ".slow(4)

let fast_1_guitar_1 = electricGuitar(
  arrange(
    [25*4+1,
        "~"
    ],
    [3+36*4+1,fast_1_motiff            // 13 13 14 13 11 ~ 10 10
        .scale(fast_1_arrangeKeys[2])  // 13 11 ~  13 11 ~ 10 10
        .scaleTranspose("13!6 10!2")   // 13 13 14 13 11 ~ 10 10
        .gain(arrange(                 // 13 ~  ~  13 11 ~ 10 10
          [5, tri.segment(5*16).range(1/16,1).drop(5*-8).slow(5)],
          [143, "1"],
        ))
    ],
    [2+12*3+2,fast_1_motiff            // 8 8 9 8 6 ~ 4 4
        .scale(fast_1_arrangeKeys[3])  // 8 6 ~ 8 6 ~ 4 4
        .scaleTranspose("8!6 4!2")     // 8 8 9 8 6 ~ 4 4
        .gain(1)                       // 8 ~ ~ 8 6 ~ 4 4
    ],
    [1+9*4+3,fast_1_motiff             // 13 13 14 13 11 ~ 10 10
        .scale(fast_1_arrangeKeys[4])  // 13 11 ~  13 11 ~ 10 10
        .scaleTranspose("13!6 10!2")   // 13 13 14 13 11 ~ 10 10
        .gain(arrange(                 // 13 ~  ~  13 11 ~ 10 10
          [36, "1"],
          [4, tri.segment(4*16).range(1,1/16).drop(4*-8).slow(4)],
        ))
    ],
    [1, "~"], // For easier aligment in the final loop
  )
).color(colors[0]).seed(0)

let fast_1_guitar_2 = electricGuitar(
  arrange(
    [31*4+1,
        "~"
    ],
    [3+30*4+1,fast_1_motiff            // 13 13 14 13 11 ~ 10 10
        .scale(fast_1_arrangeKeys[2])  // 13 11 ~  13 11 ~ 10 10
        .scaleTranspose("13!6 10!2")   // 13 13 14 13 11 ~ 10 10
        .apply(rot(4,8))               // 13 ~  ~  13 11 ~ 10 10
        .gain(arrange(
          [3.5, tri.segment(3.5*16).range(1/16,1).drop(3.5*-8).slow(3.5)],
          [120.5, "1"],
        ))
    ],
    [2+12*3+2,fast_1_motiff          // 8 8 9 8 6 ~ 4 4
        .scale(fast_1_arrangeKeys[3])// 8 6 ~ 8 6 ~ 4 4
        .scaleTranspose("8!6 4!2")   // 8 8 9 8 6 ~ 4 4
        .apply(rot(4,8))             // 8 ~ ~ 8 6 ~ 4 4
        .gain(1)
    ],
    [1+9*4+3,fast_1_motiff           // 13 13 14 13 11 ~ 10 10
        .scale(fast_1_arrangeKeys[4])// 13 11 ~  13 11 ~ 10 10
        .scaleTranspose("13!6 10!2") // 13 13 14 13 11 ~ 10 10
        .apply(rot(4,8))             // 13 ~  ~  13 11 ~ 10 10
        .gain(arrange(
          [36, "1"],
          [4, tri.segment(4*16).range(1,1/16).drop(4*-8).slow(4)],
        ))
    ],
    [1, "~"], // For easier aligment in the final loop
  )
).color(colors[1]).seed(1)

let fast_1_guitar_3 = electricGuitar(
  arrange(
    ...[
      { offset: 0, fadeIn: 24, hold: 42, fadeOut: 16, scaleNote: "11", scale: fast_1_arrangeKeys[0] },
      { offset: 3, fadeIn: 27, hold: 44, fadeOut: 18, scaleNote: "9",  scale: fast_1_arrangeKeys[0] },
      { offset: 3, fadeIn: 31, hold: 36, fadeOut: 20, scaleNote: "8",  scale: fast_1_arrangeKeys[0] },
      { offset: 9, fadeIn: 23, hold: 36, fadeOut: 16, scaleNote: "6",  scale: fast_1_arrangeKeys[1] },
      { offset: 3, fadeIn: 25, hold: 38, fadeOut: 12, scaleNote: "6",  scale: fast_1_arrangeKeys[1] },
      { offset: 3, fadeIn: 27, hold: 32, fadeOut: 16, scaleNote: "4",  scale: fast_1_arrangeKeys[1] },
      { offset: 3, fadeIn: 21, hold: 42, fadeOut: 18, scaleNote: "6",  scale: fast_1_arrangeKeys[1] },
      { offset: 9, fadeIn: 27, hold: 28, fadeOut: 20, scaleNote: "11", scale: fast_1_arrangeKeys[2] },
      { offset: 3, fadeIn: 21, hold: 42, fadeOut: 18, scaleNote: "9",  scale: fast_1_arrangeKeys[2] },
      { offset: 3, fadeIn: 25, hold: 42, fadeOut: 46, scaleNote: "11", scale: fast_1_arrangeKeys[2] },
    ].genFadeInFadeOut(),
    [3+7*4+1,
        "~"
    ],
    [3+26*4+1,fast_1_motiff            // 9 9 10 9 7 ~ 6 6
        .scale(fast_1_arrangeKeys[2])  // 9 7 ~  9 7 ~ 6 6
        .scaleTranspose("9!6 6!2")     // 9 9 10 9 7 ~ 6 6
        .gain(arrange(                 // 9 ~  ~ 9 7 ~ 6 6
          [3.5, tri.segment(3.5*16).range(1/16,1).drop(3.5*-8).slow(3.5)],
          [104.5, "1"],
        ))
    ],
    [2+12*3+2,fast_1_motiff            // 4 4 5 4 2 ~ 1 1
        .scale(fast_1_arrangeKeys[3])  // 4 2 ~ 4 2 ~ 1 1
        .scaleTranspose("4!6 1!2")     // 4 4 5 4 2 ~ 1 1
        .gain(1)                       // 4 ~ ~ 4 2 ~ 1 1
    ],
    [1+9*4+3,fast_1_motiff             // 9 9 10 9 7 ~ 6 6
        .scale(fast_1_arrangeKeys[4])  // 9 7 ~  9 7 ~ 6 6
        .scaleTranspose("9!6 6!2")     // 9 9 10 9 7 ~ 6 6
        .gain(arrange(                 // 9 ~  ~ 9 7 ~ 6 6
          [36, "1"],
          [4, tri.segment(4*16).range(1,1/16).drop(4*-8).slow(4)],
        ))
    ],
    [1, "~"], // For easier aligment in the final loop
  )
).color(colors[2]).seed(2)

let fast_1_guitar_4 = electricGuitar(
  arrange(
    ...[
      { offset: 9, fadeIn: 23, hold: 50, fadeOut: 14, scaleNote: "9", scale: fast_1_arrangeKeys[0] },
      { offset: 3, fadeIn: 29, hold: 32, fadeOut: 20, scaleNote: "7", scale: fast_1_arrangeKeys[0] },
      { offset: 3, fadeIn: 29, hold: 42, fadeOut: 22, scaleNote: "6", scale: fast_1_arrangeKeys[0] },
      { offset: 3, fadeIn: 25, hold: 34, fadeOut: 16, scaleNote: "6", scale: fast_1_arrangeKeys[1] },
      { offset: 3, fadeIn: 27, hold: 34, fadeOut: 14, scaleNote: "6", scale: fast_1_arrangeKeys[1] },
      { offset: 3, fadeIn: 29, hold: 26, fadeOut: 20, scaleNote: "3", scale: fast_1_arrangeKeys[1] },
      { offset: 3, fadeIn: 23, hold: 42, fadeOut: 22, scaleNote: "4", scale: fast_1_arrangeKeys[1] },
      { offset: 3, fadeIn: 29, hold: 30, fadeOut: 16, scaleNote: "9", scale: fast_1_arrangeKeys[2] },
      { offset: 3, fadeIn: 23, hold: 38, fadeOut: 20, scaleNote: "7", scale: fast_1_arrangeKeys[2] },
      { offset: 3, fadeIn: 27, hold: 34, fadeOut: 46, scaleNote: "6", scale: fast_1_arrangeKeys[2] },
    ].genFadeInFadeOut(),
    [3+11*4+1,
        "~"
    ],
    [3+22*4+1,fast_1_motiff            // 9 9 10 9 7 ~ 6 6
        .scale(fast_1_arrangeKeys[2])  // 9 7 ~  9 7 ~ 6 6
        .scaleTranspose("9!6 6!2")     // 9 9 10 9 7 ~ 6 6
        .apply(rot(4,8))               // 9 ~  ~ 9 7 ~ 6 6
        .gain(arrange(                 // 9 ~  ~ 9 7 ~ 6 6
          [3.5, tri.segment(3.5*16).range(1/16,1).drop(3.5*-8).slow(3.5)],
          [88.5, "1"],
        ))
    ],
    [2+12*3+2,fast_1_motiff            // 4 4 5 4 2 ~ 1 1
        .scale(fast_1_arrangeKeys[3])  // 4 2 ~ 4 2 ~ 1 1
        .scaleTranspose("4!6 1!2")     // 4 4 5 4 2 ~ 1 1
        .apply(rot(4,8))               // 4 ~ ~ 4 2 ~ 1 1
        .gain(1)
    ],
    [1+9*4+3,fast_1_motiff             // 9 9 10 9 7 ~ 6 6
        .scale(fast_1_arrangeKeys[4])  // 9 7 ~  9 7 ~ 6 6
        .scaleTranspose("9!6 6!2")     // 9 9 10 9 7 ~ 6 6
        .apply(rot(4,8))               // 9 ~  ~ 9 7 ~ 6 6
        .gain(arrange(
          [36, "1"],
          [4, tri.segment(4*16).range(1,1/16).drop(4*-8).slow(4)],
        ))
    ],
    [1, "~"], // For easier aligment in the final loop
  )
).color(colors[3]).seed(3)

let fast_1_guitar_5 = electricGuitar(
  arrange(
    ...[
      { offset: 3, fadeIn: 29, hold: 50, fadeOut: 14, scaleNote: "7", scale: fast_1_arrangeKeys[0] },
      { offset: 3, fadeIn: 29, hold: 32, fadeOut: 20, scaleNote: "5", scale: fast_1_arrangeKeys[0] },
      { offset: 3, fadeIn: 29, hold: 42, fadeOut: 16, scaleNote: "4", scale: fast_1_arrangeKeys[0] },
      { offset: 3, fadeIn: 23, hold: 42, fadeOut: 16, scaleNote: "3", scale: fast_1_arrangeKeys[1] },
      { offset: 3, fadeIn: 27, hold: 34, fadeOut: 14, scaleNote: "3", scale: fast_1_arrangeKeys[1] },
      { offset: 3, fadeIn: 29, hold: 26, fadeOut: 20, scaleNote: "2", scale: fast_1_arrangeKeys[1] },
      { offset: 3, fadeIn: 23, hold: 42, fadeOut: 14, scaleNote: "1", scale: fast_1_arrangeKeys[1] },
      { offset: 5, fadeIn: 27, hold: 38, fadeOut: 16, scaleNote: "7", scale: fast_1_arrangeKeys[2] },
      { offset: 3, fadeIn: 23, hold: 38, fadeOut: 20, scaleNote: "5", scale: fast_1_arrangeKeys[2] },
      { offset: 3, fadeIn: 27, hold: 34, fadeOut: 46, scaleNote: "4", scale: fast_1_arrangeKeys[2] },
    ].genFadeInFadeOut(),
    [3+15*4+1,
        "~"
    ],
    [3+18*4+1,fast_1_motiff            // 8 8 9 8 6 ~ 7 7
        .scale(fast_1_arrangeKeys[2])  // 8 6 ~ 8 6 ~ 7 7
        .scaleTranspose("8!6 7!2")     // 8 8 9 8 6 ~ 7 7
        .gain(arrange(                 // 8 ~ ~ 8 6 ~ 7 7
          [3.5, tri.segment(3.5*16).range(1/16,1).drop(3.5*-8).slow(3.5)],
          [72.5, "1"],
        ))
    ],
    [2+12*3+2,fast_1_motiff            // 3 3 4 3 1 ~ 0 0
        .scale(fast_1_arrangeKeys[3])  // 3 1 ~ 3 1 ~ 0 0
        .scaleTranspose("3!6 0!2")     // 3 3 4 3 1 ~ 0 0
        .gain(1)                       // 3 ~ ~ 3 1 ~ 0 0
    ],
    [1+9*4+3,fast_1_motiff             // 8 8 9 8 6 ~ 7 7
        .scale(fast_1_arrangeKeys[4])  // 8 6 ~ 8 6 ~ 7 7
        .scaleTranspose("8!6 7!2")     // 8 8 9 8 6 ~ 7 7
        .gain(arrange(                 // 8 ~ ~ 8 6 ~ 7 7
          [36, "1"],
          [4, tri.segment(4*16).range(1,1/16).drop(4*-8).slow(4)],
        ))
    ],
    [1, "~"], // For easier aligment in the final loop
  )
).color(colors[4]).seed(4)

let fast_1_guitar_6 = electricGuitar(
  arrange(
    ...[
      { offset: 0, fadeIn: 24, hold: 58, fadeOut: 20, scaleNote: "6", scale: fast_1_arrangeKeys[0] },
      { offset: 3, fadeIn: 27, hold: 28, fadeOut: 26, scaleNote: "4", scale: fast_1_arrangeKeys[0] },
      { offset: 3, fadeIn: 27, hold: 38, fadeOut: 16, scaleNote: "3", scale: fast_1_arrangeKeys[0] },
      { offset: 3, fadeIn: 23, hold: 46, fadeOut: 18, scaleNote: "1", scale: fast_1_arrangeKeys[1] },
      { offset: 3, fadeIn: 29, hold: 30, fadeOut: 16, scaleNote: "2", scale: fast_1_arrangeKeys[1] },
      { offset: 3, fadeIn: 27, hold: 28, fadeOut: 20, scaleNote: "1", scale: fast_1_arrangeKeys[1] },
      { offset: 3, fadeIn: 25, hold: 34, fadeOut: 22, scaleNote: "1", scale: fast_1_arrangeKeys[1] },
      { offset: 3, fadeIn: 29, hold: 34, fadeOut: 18, scaleNote: "6", scale: fast_1_arrangeKeys[2] },
      { offset: 3, fadeIn: 25, hold: 34, fadeOut: 22, scaleNote: "4", scale: fast_1_arrangeKeys[2] },
      { offset: 3, fadeIn: 29, hold: 26, fadeOut: 46, scaleNote: "3", scale: fast_1_arrangeKeys[2] },
    ].genFadeInFadeOut(),
    [3+19*4+1,
        "~"
    ],
    [3+14*4+1,fast_1_motiff            // 6 6 7 6 4 ~ 3 3
        .scale(fast_1_arrangeKeys[2])  // 6 4 ~ 6 4 ~ 3 3
        .scaleTranspose("6!6 3!2")     // 6 6 7 6 4 ~ 3 3
        .apply(rot(4,8))               // 6 ~ ~ 6 4 ~ 3 3
        .gain(arrange(
          [3.5, tri.segment(3.5*16).range(1/16,1).drop(3.5*-8).slow(3.5)],
          [56.5, "1"],
        ))
    ],
    [2+12*3+2,fast_1_motiff            // 1 1  2 1 -1 ~ -3 -3
        .scale(fast_1_arrangeKeys[3])  // 1 -1 ~ 1 -1 ~ -3 -3
        .scaleTranspose("1!6 -3!2")    // 1 1  2 1 -1 ~ -3 -3
        .apply(rot(4,8))               // 1 ~ ~  1 -1 ~ -3 -3
        .gain(1)
    ],
    [1+9*4+3,fast_1_motiff             // 6 6 7 6 4 ~ 3 3
        .scale(fast_1_arrangeKeys[4])  // 6 4 ~ 6 4 ~ 3 3
        .scaleTranspose("6!6 3!2")     // 6 6 7 6 4 ~ 3 3
        .apply(rot(4,8))               // 6 ~ ~ 6 4 ~ 3 3
        .gain(arrange(
          [36, "1"],
          [4, tri.segment(4*16).range(1,1/16).drop(4*-8).slow(4)],
        ))
    ],
    [1, "~"], // For easier aligment in the final loop
  )
).color(colors[5]).seed(5)

let fast_1_guitar_7 = electricGuitar(
  arrange(
    ...[
      { offset: 0, fadeIn: 24, hold: 58, fadeOut: 20, scaleNote: "5", scale: fast_1_arrangeKeys[0] },
      { offset: 3, fadeIn: 27, hold: 28, fadeOut: 26, scaleNote: "3", scale: fast_1_arrangeKeys[0] },
      { offset: 3, fadeIn: 27, hold: 38, fadeOut: 22, scaleNote: "2", scale: fast_1_arrangeKeys[0] },
      { offset: 3, fadeIn: 25, hold: 38, fadeOut: 18, scaleNote: "0", scale: fast_1_arrangeKeys[1] },
      { offset: 3, fadeIn: 29, hold: 30, fadeOut: 16, scaleNote: "1", scale: fast_1_arrangeKeys[1] },
      { offset: 3, fadeIn: 27, hold: 28, fadeOut: 20, scaleNote: "0", scale: fast_1_arrangeKeys[1] },
      { offset: 3, fadeIn: 25, hold: 34, fadeOut: 22, scaleNote: "0", scale: fast_1_arrangeKeys[1] },
      { offset: 3, fadeIn: 29, hold: 34, fadeOut: 18, scaleNote: "5", scale: fast_1_arrangeKeys[2] },
      { offset: 3, fadeIn: 25, hold: 34, fadeOut: 22, scaleNote: "3", scale: fast_1_arrangeKeys[2] },
      { offset: 3, fadeIn: 29, hold: 26, fadeOut: 46, scaleNote: "1", scale: fast_1_arrangeKeys[2] },
    ].genFadeInFadeOut(),
    [3+23*4+1,
        "~"
    ],
    [3+10*4+1,fast_1_motiff            // 6 6 7 6 4 ~ 3 3
        .scale(fast_1_arrangeKeys[2])  // 6 4 ~ 6 4 ~ 3 3
        .scaleTranspose("6!6 3!2")     // 6 6 7 6 4 ~ 3 3
        .gain(arrange(                 // 6 ~ ~ 6 4 ~ 3 3
          [3.5, tri.segment(3.5*16).range(1/16,1).drop(3.5*-8).slow(3.5)],
          [40.5, "1"],
        ))
    ],
    [2+12*3+2,fast_1_motiff            // 1 1  2 1 -1 ~ -3 -3
        .scale(fast_1_arrangeKeys[3])  // 1 -1 ~ 1 -1 ~ -3 -3
        .scaleTranspose("1!6 -3!2")    // 1 1  2 1 -1 ~ -3 -3
        .gain(1)                       // 1 ~ ~  1 -1 ~ -3 -3
    ],
    [1+9*4+3,fast_1_motiff             // 6 6 7 6 4 ~ 3 3
        .scale(fast_1_arrangeKeys[4])  // 6 4 ~ 6 4 ~ 3 3
        .scaleTranspose("6!6 3!2")     // 6 6 7 6 4 ~ 3 3
        .gain(arrange(                 // 6 ~ ~ 6 4 ~ 3 3
          [36, "1"],
          [4, tri.segment(4*16).range(1,1/16).drop(4*-8).slow(4)],
        ))
    ],
    [1, "~"], // For easier aligment in the final loop
  )
).color(colors[6]).seed(6)

let fast_1_guitar_8 = electricGuitar(
  arrange(
    ...[
      { offset: 24, fadeIn: 24, hold: 34, fadeOut: 20, scaleNote: "4", scale: fast_1_arrangeKeys[0] },
      { offset: 3,  fadeIn: 27, hold: 28, fadeOut: 26, scaleNote: "2", scale: fast_1_arrangeKeys[0] },
      { offset: 3,  fadeIn: 27, hold: 38, fadeOut: 16, scaleNote: "1", scale: fast_1_arrangeKeys[0] },
      // 2 '~' eightnotes added by genFadeInFadeOut()
    ].genFadeInFadeOut(),
    [41,
        "~"
    ],
    ...[
      { offset: 3, fadeIn: 29, hold: 34, fadeOut: 18, scaleNote: "4", scale: fast_1_arrangeKeys[2] },
      { offset: 3, fadeIn: 25, hold: 34, fadeOut: 22, scaleNote: "2", scale: fast_1_arrangeKeys[2] },
      { offset: 3, fadeIn: 29, hold: 26, fadeOut: 46, scaleNote: "1", scale: fast_1_arrangeKeys[2] },
    ].genFadeInFadeOut(),
    [3+20*4+1,
        "~"
    ],
    [3+4*13+1,fast_1_motiff            // 2 2 3 2 0 ~ -1 -1
        .scale(fast_1_arrangeKeys[2])  // 2 0 ~ 2 0 ~ -1 -1
        .scaleTranspose("2!6 -1!2")    // 2 2 3 2 0 ~ -1 -1
                                       // 2 ~ ~ 2 0 ~ -1 -1
        .struct(arrange([7, cat("~ ~ x x x ~ ~ ~",
                                "x x ~ x x ~ ~ ~")],
                        [49, "x!8"]))
        .gain(1)
    ],
    [2+12*3+2,fast_1_motiff            // -3 -3 -2 -3 -5 ~ -6 -6
        .scale(fast_1_arrangeKeys[3])  // -3 -5 ~  -3 -5 ~ -6 -6
        .scaleTranspose("-3!6 -6!2")   // -3 -3 -2 -3 -5 ~ -6 -6
        .gain(1)                       // -3 ~  ~  -3 -5 ~ -6 -6
    ],
    [1+9*4+3,fast_1_motiff             // 2 2 3 2 0 ~ -1 -1
        .scale(fast_1_arrangeKeys[4])  // 2 0 ~ 2 0 ~ -1 -1
        .scaleTranspose("2!6 -1!2")    // 2 2 3 2 0 ~ -1 -1
        .gain(arrange(                 // 2 ~ ~ 2 0 ~ -1 -1
          [36, "1"],
          [4, tri.segment(4*16).range(1,1/16).drop(4*-8).slow(4)],
        ))
    ],
    [1, "~"], // For easier aligment in the final loop
  )
).color(colors[7]).seed(7)

let fast_1_guitar_9 = electricGuitar(
  arrange(
    [53*4+1,
        "~"
    ],
    ...[
       { offset: 1, fadeIn: 23, hold: 42,  fadeOut: 18, scaleNote: "[5, 7, 9]",   scale: fast_1_arrangeKeys[2] },
       { offset: 5, fadeIn: 23, hold: 58,  fadeOut: 18, scaleNote: "[7, 9, 11]",  scale: fast_1_arrangeKeys[2] },
       { offset: 5, fadeIn: 23, hold: 42,  fadeOut: 26, scaleNote: "[9, 11, 13]", scale: fast_1_arrangeKeys[2] },
       { offset: 5, fadeIn: 23, hold: 34,  fadeOut: 18, scaleNote: "[4, 6, 8]",   scale: fast_1_arrangeKeys[3] },
       { offset: 5, fadeIn: 23, hold: 34,  fadeOut: 18, scaleNote: "[4, 6, 9]",   scale: fast_1_arrangeKeys[3] },
       { offset: 5, fadeIn: 23, hold: 34,  fadeOut: 18, scaleNote: "[2, 4, 6]",   scale: fast_1_arrangeKeys[3] },
       { offset: 5, fadeIn: 23, hold: 34,  fadeOut: 18, scaleNote: "[1, 4]",      scale: fast_1_arrangeKeys[3] },
       { offset: 5, fadeIn: 23, hold: 34,  fadeOut: 18, scaleNote: "[0, 2, 4]",   scale: fast_1_arrangeKeys[4] },
       { offset: 5, fadeIn: 23, hold: 34,  fadeOut: 18, scaleNote: "[2, 4, 6]",   scale: fast_1_arrangeKeys[4] },
       { offset: 5, fadeIn: 23, hold: 72,  fadeOut: 22, scaleNote: "[4, 6, 8]",   scale: fast_1_arrangeKeys[4] },
     ].genFadeInFadeOut(),
    [2+3,
        "~"
    ],
    [1, "~"], // For easier aligment in the final loop
  )
).color(colors[8]).seed(8)

let fast_1_guitar_10 = electricGuitar(
  arrange(
    [53*4+1,
        "~"
    ],
    ...[
       { offset: 1, fadeIn: 23, hold: 42,  fadeOut: 18, scaleNote: "[4, 6]",  scale: fast_1_arrangeKeys[2] },
       { offset: 5, fadeIn: 23, hold: 58,  fadeOut: 18, scaleNote: "[6, 8]",  scale: fast_1_arrangeKeys[2] },
       { offset: 5, fadeIn: 23, hold: 42,  fadeOut: 26, scaleNote: "[8, 10]", scale: fast_1_arrangeKeys[2] },
       { offset: 5, fadeIn: 23, hold: 34,  fadeOut: 18, scaleNote: "[0, 3]",  scale: fast_1_arrangeKeys[3] },
       { offset: 5, fadeIn: 23, hold: 34,  fadeOut: 18, scaleNote: "[1, 3]",  scale: fast_1_arrangeKeys[3] },
       { offset: 5, fadeIn: 23, hold: 34,  fadeOut: 18, scaleNote: "[1, 3]",  scale: fast_1_arrangeKeys[3] },
       { offset: 5, fadeIn: 23, hold: 34,  fadeOut: 18, scaleNote: "[0, 3]",  scale: fast_1_arrangeKeys[3] },
       { offset: 5, fadeIn: 23, hold: 34,  fadeOut: 18, scaleNote: "[4, 6]",  scale: fast_1_arrangeKeys[4] },
       { offset: 5, fadeIn: 23, hold: 34,  fadeOut: 18, scaleNote: "[6, 8]",  scale: fast_1_arrangeKeys[4] },
       { offset: 5, fadeIn: 23, hold: 71,  fadeOut: 23, scaleNote: "[8, 10]", scale: fast_1_arrangeKeys[4] },
     ].genFadeInFadeOut(),
     [2+3,
        "~"
     ],
    [1, "~"], // For easier aligment in the final loop
  )
).color(colors[9]).seed(9)

// Error in notation here *sigh*
let fast_1_bass_guitar_1_2 = bassGuitar(
   arrange(
     ...[
       { offset: 33, fadeIn: 23, hold: 8,  fadeOut: 24, scaleNote: "[-11, -4]", scale: fast_1_arrangeKeys[0] },
       { offset: 26, fadeIn: 22, hold: 18, fadeOut: 22, scaleNote: "[-9,  -2]", scale: fast_1_arrangeKeys[0] },
       { offset: 22, fadeIn: 26, hold: 18, fadeOut: 22, scaleNote: "[-14, -7]", scale: fast_1_arrangeKeys[0] },
       { offset: 24, fadeIn: 24, hold: 14, fadeOut: 22, scaleNote: "[-16, -9]", scale: fast_1_arrangeKeys[1] },
       { offset: 24, fadeIn: 28, hold: 10, fadeOut: 14, scaleNote: "[-14, -7]", scale: fast_1_arrangeKeys[1] },
       { offset: 26, fadeIn: 24, hold: 10, fadeOut: 22, scaleNote: "[-16, -9]", scale: fast_1_arrangeKeys[1] },
       { offset: 24, fadeIn: 24, hold: 14, fadeOut: 22, scaleNote: "-12",       scale: fast_1_arrangeKeys[1] },
       { offset: 24, fadeIn: 28, hold: 14, fadeOut: 18, scaleNote: "[-11, -4]", scale: fast_1_arrangeKeys[2] },
       { offset: 24, fadeIn: 24, hold: 14, fadeOut: 22, scaleNote: "[-9,  -2]", scale: fast_1_arrangeKeys[2] },
       { offset: 24, fadeIn: 28, hold: 10, fadeOut: 52, scaleNote: "[-14, -7]", scale: fast_1_arrangeKeys[2] },
     ].genFadeInFadeOut(),
     [3+25*4+2,
        "~"
    ],
    ...[
       { offset: 4,  fadeIn: 20, hold: 24,  fadeOut: 20, scaleNote: "[-11, -4]",  scale: fast_1_arrangeKeys[2] },
       { offset: 24, fadeIn: 20, hold: 42,  fadeOut: 18, scaleNote: "[-9,  -2]",  scale: fast_1_arrangeKeys[2] },
       { offset: 24, fadeIn: 20, hold: 26,  fadeOut: 26, scaleNote: "[-14, -7]",  scale: fast_1_arrangeKeys[2] },
       { offset: 24, fadeIn: 20, hold: 18,  fadeOut: 18, scaleNote: "[-16, -9]",  scale: fast_1_arrangeKeys[3] },
       { offset: 24, fadeIn: 20, hold: 18,  fadeOut: 16, scaleNote: "[-14, -7]",  scale: fast_1_arrangeKeys[3] },
       { offset: 24, fadeIn: 20, hold: 18,  fadeOut: 18, scaleNote: "[-16, -9]",  scale: fast_1_arrangeKeys[3] },
       { offset: 24, fadeIn: 20, hold: 18,  fadeOut: 18, scaleNote: "-12",        scale: fast_1_arrangeKeys[3] },
       { offset: 24, fadeIn: 20, hold: 18,  fadeOut: 18, scaleNote: "[-11, -4]",  scale: fast_1_arrangeKeys[4] },
       { offset: 20, fadeIn: 18, hold: 18,  fadeOut: 18, scaleNote: "[-9,  -2]",  scale: fast_1_arrangeKeys[4] },
       { offset: 24, fadeIn: 20, hold: 58,  fadeOut: 22, scaleNote: "[-14,  -7]", scale: fast_1_arrangeKeys[4] },
     ].genFadeInFadeOut(),
    [3+3,
        "~"
    ],
    [1, "~"], // For easier aligment in the final loop
   )
).color(colors[10]).seed(10)

let fast_1 = stack(
  fast_1_guitar_1,
  fast_1_guitar_2,
  fast_1_guitar_3,
  fast_1_guitar_4,
  fast_1_guitar_5,
  fast_1_guitar_6,
  fast_1_guitar_7,
  fast_1_guitar_8,
  fast_1_guitar_9,
  fast_1_guitar_10,
  fast_1_bass_guitar_1_2,
).cpm(192/4)
.early(perlin.range(-1/(8*desyncScale),1/(8*desyncScale)))

// ----- SLOW 1 -----

// This part progresses through metrums 3/4 -> 5/8 -> 4/4
// We set the cycle to sum of them => 6/8 + 5/8 + 8/8 = 19/8

const slow_1_arrangeKeys = ["C#5:Minor"]


// These are too irregular to simply scale down on scale but maybe could be applied with a pick/inhabit/struct or smth
const slow_1_motiff_1 = " \
        6 3@2 2@2 1 \
        [4 6] 3@2 0@2 \
        6 3@2 2@2 4 1@2 \
        "

const slow_1_motiff_2 = " \
        9 6@2 8@2 4 \
        [7 9] 6@2 3@2 \
        9 6@2 8@2 7 4@2 \
        "

const slow_1_motiff_3 = " \
        3 -1@2 1@2 -3 \
        [0 2] -1@2 -4@2 \
        3 -1@2 1@2 0 -3@2 \
        "

let slow_1_guitar_1 = electricGuitar(
  arrange(
    [34, slow_1_motiff_1
        .scale(slow_1_arrangeKeys[0])
        .gain(arrange(
          [33, "1"],
          [1, tri.segment(38).range(1/19,1).drop(19)],
        ))
    ],
    [1, "~"], // For easier aligment in the final loop
  )
).color(colors[0]).seed(0)

let slow_1_guitar_2 = electricGuitar(
  arrange(
    [1*13/19, "~"],
    [34-(1*13/19), slow_1_motiff_1
        .scale(slow_1_arrangeKeys[0])
        .apply(rot(11,19))
        .gain(arrange(
          [33-(1*13/19), "1"],
          [1, tri.segment(38).range(1/19,1).drop(19)],
        ))
    ],
    [1, "~"], // For easier aligment in the final loop
  )
).color(colors[1]).seed(1)

let slow_1_guitar_3 = electricGuitar(
  arrange(
    [1*18/19, "~"],
    [34-(1*18/19), slow_1_motiff_1
        .scale(slow_1_arrangeKeys[0])
        .gain(arrange(
          [33-(1*18/19), "1"],
          [1, tri.segment(38).range(1/19,1).drop(19)],
        ))
    ],
    [1, "~"], // For easier aligment in the final loop
  )
).color(colors[2]).seed(2)

let slow_1_guitar_4 = electricGuitar(
  arrange(
    [3, "~"],
    [31, slow_1_motiff_2
        .scale(slow_1_arrangeKeys[0])
        .gain(arrange(
          [1, tri.segment(38).range(1/19,1).drop(-19)],
          [29, "1"],
          [1, tri.segment(38).range(1/19,1).drop(19)],
        ))
    ],
    [1, "~"], // For easier aligment in the final loop
  )
).color(colors[3]).seed(3)

let slow_1_guitar_5 = electricGuitar(
  arrange(
    [5, "~"],
    [29, slow_1_motiff_2
        .scale(slow_1_arrangeKeys[0])
        .apply(rot(17,19))
        .gain(arrange(
          [1, tri.segment(38).range(1/19,1).drop(-19)],
          [27, "1"],
          [1, tri.segment(38).range(1/19,1).drop(19)],
        ))
    ],
    [1, "~"], // For easier aligment in the final loop
  )
).color(colors[4]).seed(4)

let slow_1_guitar_6 = electricGuitar(
  arrange(
    [8, "~"],
    [26, slow_1_motiff_2
        .scale(slow_1_arrangeKeys[0])
        .apply(rot(1,19))
        .gain(arrange(
          [1, tri.segment(38).range(1/19,1).drop(-19)],
          [24, "1"],
          [1, tri.segment(38).range(1/19,1).drop(19)],
        ))
    ],
    [1, "~"], // For easier aligment in the final loop
  )
).color(colors[5]).seed(5)

let slow_1_guitar_7 = electricGuitar(
  arrange(
    [10, "~"],
    [24, slow_1_motiff_3
        .scale(slow_1_arrangeKeys[0])
        .gain(arrange(
          [1, tri.segment(38).range(1/19,1).drop(-19)],
          [22, "1"],
          [1, tri.segment(38).range(1/19,1).drop(19)],
        ))
    ],
    [1, "~"], // For easier aligment in the final loop
  )
).color(colors[6]).seed(6)

let slow_1_guitar_8 = electricGuitar(
  arrange(
    [12, "~"],
    [22, slow_1_motiff_3
        .scale(slow_1_arrangeKeys[0])
        .apply(rot(17,19))
        .gain(arrange(
          [1, tri.segment(38).range(1/19,1).drop(-19)],
          [20, "1"],
          [1, tri.segment(38).range(1/19,1).drop(19)],
        ))
    ],
    [1, "~"], // For easier aligment in the final loop
  )
).color(colors[7]).seed(7)

let slow_1_guitar_9 = electricGuitar(
  arrange(
    [15, "~"],
    [19, slow_1_motiff_3
        .scale(slow_1_arrangeKeys[0])
        .apply(rot(1,19))
        .gain(arrange(
          [1, tri.segment(38).range(1/19,1).drop(-19)],
          [17, "1"],
          [1, tri.segment(38).range(1/19,1).drop(19)],
        ))
    ],
    [1, "~"], // For easier aligment in the final loop
  )
).color(colors[8]).seed(8)

let slow_1_guitar_10 = electricGuitar(
  arrange(
    [17, "~"],
        ...[
      { offset: 2, fadeIn: 36, hold: 38, fadeOut: 22, scaleNote: "8", scale: slow_1_arrangeKeys[0] },
      { offset: 2, fadeIn: 36, hold: 38, fadeOut: 28, scaleNote: "9", scale: slow_1_arrangeKeys[0] },
      { offset: 2, fadeIn: 36, hold: 38, fadeOut: 26, scaleNote: "6", scale: slow_1_arrangeKeys[0] },
      { offset: 2, fadeIn: 36, hold: 16, fadeOut: 26, scaleNote: "8", scale: slow_1_arrangeKeys[0] },
      { offset: 2, fadeIn: 36, hold: 38, fadeOut: 22, scaleNote: "9", scale: slow_1_arrangeKeys[0] },
      { offset: 2, fadeIn: 36, hold: 66, fadeOut: 26, scaleNote: "6", scale: slow_1_arrangeKeys[0] },
    ].genFadeInFadeOut(19*2),
    [1+8/19, "~"],
    [1, "~"], // For easier aligment in the final loop
  )
).color(colors[9]).seed(9)


let slow_1_guitar_11 = electricGuitar(
  arrange(
    [17, "~"],
        ...[
      { offset: 6, fadeIn: 32, hold: 38, fadeOut: 22, scaleNote: "[3, 6]", scale: slow_1_arrangeKeys[0] },
      { offset: 6, fadeIn: 32, hold: 38, fadeOut: 28, scaleNote: "[4, 7]", scale: slow_1_arrangeKeys[0] },
      { offset: 6, fadeIn: 32, hold: 38, fadeOut: 26, scaleNote: "[2, 4]", scale: slow_1_arrangeKeys[0] },
      { offset: 6, fadeIn: 32, hold: 16, fadeOut: 26, scaleNote: "[3, 6]", scale: slow_1_arrangeKeys[0] },
      { offset: 6, fadeIn: 32, hold: 38, fadeOut: 22, scaleNote: "[4, 7]", scale: slow_1_arrangeKeys[0] },
      { offset: 6, fadeIn: 32, hold: 66, fadeOut: 26, scaleNote: "[2, 4]", scale: slow_1_arrangeKeys[0] },
    ].genFadeInFadeOut(19*2),
    [1+8/19, "~"],
    [1, "~"], // For easier aligment in the final loop
  )
).color(colors[10]).seed(10)

let slow_1_guitar_12 = electricGuitar(
  arrange(
    [17, "~"],
        ...[
      { offset: 10, fadeIn: 28, hold: 38, fadeOut: 22, scaleNote: "[2, 4]", scale: slow_1_arrangeKeys[0] },
      { offset: 10, fadeIn: 28, hold: 38, fadeOut: 28, scaleNote: "[3, 6]", scale: slow_1_arrangeKeys[0] },
      { offset: 10, fadeIn: 28, hold: 38, fadeOut: 26, scaleNote: "[1, 3]", scale: slow_1_arrangeKeys[0] },
      { offset: 10, fadeIn: 28, hold: 16, fadeOut: 26, scaleNote: "[2, 4]", scale: slow_1_arrangeKeys[0] },
      { offset: 10, fadeIn: 28, hold: 38, fadeOut: 22, scaleNote: "[3, 6]", scale: slow_1_arrangeKeys[0] },
      { offset: 10, fadeIn: 28, hold: 66, fadeOut: 26, scaleNote: "[1, 3]", scale: slow_1_arrangeKeys[0] },
    ].genFadeInFadeOut(19*2),
    [1+8/19, "~"],
    [1, "~"], // For easier aligment in the final loop
  )
).color(colors[11]).seed(11)

let slow_1_bass_1_2 = bassGuitar(
  arrange(
    [17, "~"],
        ...[
      { offset: 18, fadeIn: 32, hold: 18, fadeOut: 20, scaleNote: "[-11, -18]", scale: slow_1_arrangeKeys[0] },
      { offset: 28, fadeIn: 36, hold: 12, fadeOut: 26, scaleNote: "[-9, -16]",  scale: slow_1_arrangeKeys[0] },
      { offset: 30, fadeIn: 30, hold: 16, fadeOut: 22, scaleNote: "[-7, -14]",  scale: slow_1_arrangeKeys[0] },
      { offset: 34, fadeIn: 20, hold: 6,  fadeOut: 16, scaleNote: "[-11, -18]", scale: slow_1_arrangeKeys[0] },
      { offset: 34, fadeIn: 32, hold: 18, fadeOut: 20, scaleNote: "[-9, -16]",  scale: slow_1_arrangeKeys[0] },
      { offset: 30, fadeIn: 34, hold: 38, fadeOut: 22, scaleNote: "[-7, -14]",  scale: slow_1_arrangeKeys[0] },
    ].genFadeInFadeOut(19*2),
    [1+8/19, "~"],
    [1, "~"], // For easier aligment in the final loop
  )
).color(colors[12]).seed(12)

let slow_1 = stack(
  slow_1_guitar_1,
  slow_1_guitar_2,
  slow_1_guitar_3,
  slow_1_guitar_4,
  slow_1_guitar_5,
  slow_1_guitar_6,
  slow_1_guitar_7,
  slow_1_guitar_8,
  slow_1_guitar_9,
  slow_1_guitar_10,
  slow_1_guitar_11,
  slow_1_guitar_12,
  slow_1_bass_1_2,
)
// with ♩=96 => cpm=96/(4+3+2.625) as in amounts of ♩ in 3/4 + 4/4 + 5/8
.cpm(96/8.625)
.early(perlin.range(-1/(19*desyncScale),1/(19*desyncScale)))

// ----- FAST 2 -----



// Couldnt find a better solution to playing them sequentially
// we specify the time division how much they'd take if placed in a single cycle in seconds
setcpm(60)
$: "< a@412 b@183 >".pickRestart({ a: fast_1, b: slow_1})
  .early(0) // Specify the starting second
