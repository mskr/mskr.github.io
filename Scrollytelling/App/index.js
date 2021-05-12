import init from './Beuys/init.js';
import asyncData from './Beuys/asyncData.js';
import animate from './Beuys/animate.js';

init().then(asyncData).then(animate);