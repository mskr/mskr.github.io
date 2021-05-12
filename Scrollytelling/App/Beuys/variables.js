let Beuys = {}

Beuys.server = window.location.origin

Beuys.root = window.location.origin + window.location.pathname

Beuys.backend = Beuys.root + '../Backend/Beuys/'

Beuys.FBXfolder = Beuys.root + '../FBX/'

Beuys.Set = Beuys.FBXfolder + 'Set/Beuys_Tour_jpg.fbx'

Beuys.Vistas = Beuys.FBXfolder + 'Vistas/Vistas.fbx'

Beuys.Quotes = Beuys.FBXfolder + 'Quotes/Quotes.fbx'

Beuys.VistaNames = ['B_Book', 'D_Sledge', 'F_Das_Kapiital', 'J_Capri']

Beuys.JSONsource = Beuys.root + '../JSON/Beuys.json'

Beuys.lutPath = Beuys.root + 'Assets/LUTS/'

Beuys.JSON = {} // encapsulate in access.js

Beuys.POIs = [] // encapsulate in access.js

Beuys.scrollContainer

Beuys.currentY

Beuys.currentFloatIndex

Beuys.currentPageFloatIndex

Beuys.path

Beuys.pathCamera

Beuys.freeCamera

Beuys.arrayCamera // remove

Beuys.cameras = [] // remove

Beuys.up = [0, 1, 0] // remove

Beuys.controls

Beuys.scene

Beuys.renderer

Beuys.labelRenderer

Beuys.statusBar

Beuys.stats

Beuys.pathMesh = null

Beuys.groundPlane

Beuys.EditPathScreenSize = 0.1

Beuys.videoElement

Beuys.videoTexture

export default Beuys