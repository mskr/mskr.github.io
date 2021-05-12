import Beuys from './variables.js';
import PUT from '../utils/PUT.js';

// dat gui
// https://github.com/dataarts/dat.gui

/*
boolean => checkbox
int/float => slider
string => text input
function => button
array => select
*/

let params = {}

params.enableToneMapGui = true;
params.enableLutGui = true;
params.enableDebugGui = false;

params.CloudSync = true
params.EditOrientation = false
params.Graph = false
params.Message = 'Ready :)'
params.Help = () => alert('\
	How to orient: \n\
	 - Check EditOrientation box \n\
	Then use controls: \n\
	 - WASD = move, \n\
	 - R | F = up | down, \n\
	 - Q | E = roll\n\
	 - up | down = pitch\n\
	 - left | right = yaw \n\
	You can jump to POIs by click in list. \n\
	However then you leave the scroll position. \n\
	The Jumping checkbox shows you if you have left. \n\
	You can jump back to scroll position via button.')
params.Jumping = false;
params.JumpBack = () => {
  alert('\
		You can jump to POIs but scrollbar is unchanged. \n\
		Jump now back to scroll position.');
}

params.Position = ''
params.Rotation = ''
params.Speed = 1
params.FoV_mobile = 45
params.FoV_desktop = 45
params.FloatIndex = 0

params.createPOI = () => alert('Not implemented')
params.createHelper = () => alert('Not implemented')
params.save = () => PUT(JSON.stringify(Beuys.JSON, null, '  '), 'application/json;charset=UTF-8',
  'https://zaubar.com/zaubar-web-tour/Backend/PUT.php').then((response) => alert(response.status))

params.LengthUnit = 50 // px
params.showSpheres = false
params.showPath = false
params.minimap = false


// The above is actually not used anymore ;)
// But the vfx params are important:

params.vfx = {
  hiresOnDesktop: true,
  hiresOnDesktopLow: false,
  hiresOnMobile: false,

  projectorVfxParams: {
    enabled: true, // global switch

    numPlanes: 15, // reduce if slow
    numStrips: 20, // do NOT reduce if slow
    opacity: 0.3, // reduce if too bright
    startOffset: 0.02, // distance to projector "lens"
    endOffset: 0.7, // planes end this ratio from screen
    multiSample: false, // try set to false if slow
    audioFile: 'Assets/Audios/mixkit-vintage-film-projector-working-1441-short.ogg',
    projectorLensPosition: [
      10.65857697137069,
      2.5496859043066036,
      -14.116461694476758
    ],
    audioOn: true,
    spatialAudio: false,
    audioVolume: .5,
    loopAudio: true,
    // also used in params.yEvents (see below)
    segments: [{
      start: 3.0,
      end: 10.0,
      fadeIn: .1,
      fadeOut: 1,
      audioVolume: .3,
    },
    {
      start: 72,
      end: Infinity,
      fadeIn: .5,
      fadeOut: .3,
      audioVolume: .2,
    }]
  },

  bloomPassParams: {
    enabled: true,
    hDPI: true,
    segments: [
      {
        start: 0,
        end: Infinity,
        fadeIn: .5,
        fadeOut: .5,
        bloomStrength: 0.15,
        bloomThreshold: 0.97,
        bloomRadius: 0
      }
    ]
  },

  // unfinished/hard to use: simple Depth of Field (DOF)
  bokehPassParams: {
    enabled: false,
    hDPI: true,
    segments: [
      {
        start: 3,
        end: 1000,
        fadeIn: .1,
        fadeOut: .1,
        aperture: 5,
        maxBlur: 20,
      },
    ]
  },

  toneMappingParams: {
    enabled: false,
    segments: [
      {
        start: 0,
        end: Infinity,

        // "None"
        // "Linear"
        // "Reinhard"
        // "Cineon"
        // "ACESFilmic"
        // "Custom"
        toneMapping: "Custom",
        exposure: 0.9
      }
    ]
  },

  dustParams: {
    enabled: true,
    debug: false,
    numParticles: 300,
    sizeFactor: 0.004,
    opacityFactor: 0.2,
    saturationFactor: 1,
    luminanceFactor: 1,
    radius: 7,
    floor: -2,
    roof: 8,
    activationDistance: 14,
    speed: 1,
    segments: [
      {
        start: 3,
        end: 1000,
      },
    ]
  },

  audioParams: {
    enabled: true,
    segments: [
      {
        start: 54,
        end: 62,
        fadeIn: 1,
        fadeOut: .5,
        audioFile: "Assets/Audios/mixkit-morning-birds-singing-2467-low.ogg",
        audioOn: true,
        spatialAudio: false,
        audioVolume: .5,
        loopAudio: true,
      },
    ]
  },

  // unfinished: moving leafs
  vortexParams: {
    enabled: false,
    segments: [
      {
        start: 44,
        end: 55,
        fadeIn: 1,
        fadeOut: .5
      },
    ]
  },


  lutPassParams: {
    enabled: false,
    segments: [
      {
        start: 0,
        end: 1000,
        fadeIn: 0,
        fadeOut: 0,
        // lut: "Arabica 12.CUBE",
        lut: 'Cobi 3.CUBE',
        // lut: 'beuys.CUBE',
        intensity: 0.5,
        use2DLut: false
      },
    ]
  },

};

params.yEvents = {}

params.yEvents[Math.floor(params.vfx.projectorVfxParams.segments[0].start)] = {
  type: 'video',
  id: 'beuysVideo',
  function: 'playPause'
}

params.yEvents[Math.floor(params.vfx.projectorVfxParams.segments[0].end)] = {
  type: 'video',
  id: 'beuysVideo',
  function: 'playPause'
}

params.yEvents[Math.floor(params.vfx.projectorVfxParams.segments[1].start)] = {
  type: 'video',
  id: 'beuysVideo',
  function: 'playPause'
}

params.yEvents[Math.floor(params.vfx.projectorVfxParams.segments[1].end)] = {
  type: 'video',
  id: 'beuysVideo',
  function: 'playPause'
}

export default params