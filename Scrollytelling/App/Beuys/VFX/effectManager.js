/**
 * Keeps vfx passes ordered
 */

export class EffectManager {

    constructor(effectComposer, renderPass) {
        this.effectComposer = effectComposer;
        this.renderPass = renderPass;
        this.effects = [];
    }

    /**
     * reorder passes such that the renderPass is first, and the user passes are sorted by
     * passPriority.
     */
    updatePassOrdering() {

        // copy passes
        const passes = this.effectComposer.passes.slice();

        // remove the renderPass from our list
        const index = passes.indexOf(this.renderPass);
        if (index !== - 1) {
            passes.splice(index, 1);
        }

        // empty passes in effectComposer
        while (this.effectComposer.passes.length > 0) {
            this.effectComposer.removePass(this.effectComposer.passes[0]);
        }

        // sort local array of passes
        passes.sort((a, b) => {
            if (a.passPriority < b.passPriority) {
                return -1;
            }
            if (a.passPriority > b.passPriority) {
                return 1;
            }
            return 0;
        });

        // append renderPass first
        this.effectComposer.addPass(this.renderPass, 0);

        // append our user passes
        passes.forEach(pass => this.effectComposer.addPass(pass));
    }
}

export let effectManager = {
    instance: undefined
}
