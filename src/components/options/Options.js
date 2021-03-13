/*
 * Complex Cloud Solutions, LLC (ccs.msk.ru)
 * Ivan Goptarev
 * Copyright (c) 2020.
 */

import {Component} from '@core/Component'
import {createOptions} from '@/components/options/options.template'
import {$} from '@core/jquery.extends'

export class Options extends Component {
    static className = 'app__options'

    constructor($root, options) {
        super($root, {
            name: 'Options',
            listeners: ['click', 'input'],
            ...options
        })
        this.wrapperSelector = '.app__content'

        this.defaultSteps = {}
    }

    init() {
        super.init()

        this.$on('project:selectModel', (e) => {
            this.render()
        })

        this.$on('project:updateModel', (e) => {
            this.render()
        })


    }

    render() {
        super.render()
        const els = [...this.$root.find('*[data-needUpgrade]')]
        els.forEach(one => {
            // console.log(one, one.$el);
            // componentHandler.upgradeElement(one.$el);
            componentHandler.upgradeElement(one)
        })
    }

    toHTML() {

        const model = this.project.selectedModel
        const data = {
            model
        }
        this.defaultSteps = this.project.options.model.defaultSteps || {}
        const options = {
            opacity: this.project.options.model.opacity,
            defaultSteps: this.defaultSteps
        }
        return createOptions(data, options)

    }

    onClick(e) {

        const $target = $(e.target)
        if ($target.data('type') !== 'option_button') return

        // work with selected model
        if ($target.data('category') === 'selected') {
            if ($target.data('name') === 'remove') this.$emit('options:removeModel')
            if ($target.data('name') === 'addChild') this.$emit('options:addChild')
        } else if ($target.data('category') === 'defaultSteps') {
            if ($target.data('name') === 'apply') return this.$emit('options:applyDefaultSteps', {value: this.defaultSteps})
        } else if ($target.data('category') === 'boxSize') {
            return this.$emit(`options:boxSize_${$target.data('name')}`)
        }else if ($target.data('category') === 'wheelAxleAdd') {
            return this.$emit(`options:wheelAxleAdd_${$target.data('name')}`)
        }

    }

    onInput(e) {
        const $target = $(e.target)
        if ($target.data('type') !== 'option_input' && $target.data('type') !== 'option_switch') return

        if ($target.data('name') === 'option_opacity') return this.$emit('options:opacity', {value: +$target.val()})

        // work with selected model
        if ($target.data('category') === 'selected') {
            if ($target.data('name') === 'name') return this.$emit('options:changeName', {value: $target.val()})
            if ($target.data('name') === 'alias') return this.$emit('options:changeAlias', {value: $target.val()})
            if ($target.data('name') === 'addChild') return this.$emit('options:addChild')
        } else if ($target.data('category') === 'defaultSteps') {
            if ($target.data('name') === 'size') return this.defaultSteps.size = +$target.val()
            if ($target.data('name') === 'position') return this.defaultSteps.position = +$target.val()
            if ($target.data('name') === 'rotation') return this.defaultSteps.rotation = +$target.val()
        } else {
            const val = ($target.data('type') === 'option_switch')
                ? !$target.parent('label').hasClass('is-checked')
                : $target.val()
            const id = $target.data('id_')
            return this.$emit(`options:${$target.data('category')}_${$target.data('name')}`, {value: val, id})
        }
        // else if ($target.data('category') === 'boxContainerPosition') {
        //     if ($target.data('name') === 'x') return this.$emit('options:boxContainerPosition_x', {value:+$target.val()})
        //     if ($target.data('name') === 'y') return this.$emit('options:boxContainerPosition_y', {value:+$target.val()})
        //     if ($target.data('name') === 'z') return this.$emit('options:boxContainerPosition_z', {value:+$target.val()})
        // } else if ($target.data('category') === 'boxContainerRotation') {
        //     if ($target.data('name') === 'x') return this.$emit('options:boxContainerRotation_x', {value:+$target.val()})
        //     if ($target.data('name') === 'y') return this.$emit('options:boxContainerRotation_y', {value:+$target.val()})
        //     if ($target.data('name') === 'z') return this.$emit('options:boxContainerRotation_z', {value:+$target.val()})
        // } else if ($target.data('category') === 'boxPosition') {
        //     if ($target.data('name') === 'x') return this.$emit('options:boxPosition_x', {value:+$target.val()})
        //     if ($target.data('name') === 'y') return this.$emit('options:boxPosition_y', {value:+$target.val()})
        //     if ($target.data('name') === 'z') return this.$emit('options:boxPosition_z', {value:+$target.val()})
        // } else if ($target.data('category') === 'boxSize') {
        //     if ($target.data('name') === 'x') return this.$emit('options:boxSize_x', {value:+$target.val()})
        //     if ($target.data('name') === 'y') return this.$emit('options:boxSize_y', {value:+$target.val()})
        //     if ($target.data('name') === 'z') return this.$emit('options:boxSize_z', {value:+$target.val()})
        // }

    }
}
