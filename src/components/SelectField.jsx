import _ from 'lodash';
import { Component } from 'react';
import propTypes from 'prop-types';
import classNames from 'classnames';
import { _extend as extend } from 'util';

import log from '../utils/log';
import FormLabel from './FormLabel';
import InvalidFeedback from './InvalidFeedback';

export default class SelectField extends Component {

	static propTypes = {
		meta: propTypes.object,
		onBlur: propTypes.func,
		input: propTypes.object,
		extra: propTypes.object,
		label: propTypes.string,
		options: propTypes.array,
		multiple: propTypes.bool,
		onChange: propTypes.func
	}

	shouldComponentUpdate({ input: { value: nextValue }, meta: nextMeta }) {

		const { input: { value: previousValue }, meta: previousMeta } = this.props;

		return nextValue !== previousValue || !_.isEqual(nextMeta, previousMeta);
	}

	handleBlur = event => this.setInputValue('onBlur', this.getReduxValueByNativeEvent(event))
	handleChange = event => this.setInputValue('onChange', this.getReduxValueByNativeEvent(event))

	setInputValue(eventType, value) {

		const { input: { [eventType]: eventHandler } } = this.props;

		eventHandler({
			preventDefault: () => {},
			stopPropagation: () => {},
			target: extend(this.input, { value: value || null })
		});
	}

	getReduxValueByNativeEvent({ target: { value, options } }) {

		const { multiple } = this.props;

		const reduxValue = multiple ? _.reduce(options, (memo, { selected, value: optionValue }) => {
			if (selected) memo.push(optionValue);
			return memo;
		}, []).join('|') : value;

		return reduxValue;
	}

	get nativeValue() {

		const { input: { value }, multiple } = this.props;

		return multiple ? value.split('|') : value;
	}

	render() {

		const { meta, input, label, options, multiple } = this.props;

		options.forEach(option => option.label = option.label || option.value);

		log('SelectField', { name: input.name, options });

		return (
			<div className='form-group row'>
				<FormLabel meta={ meta } input={ input }>{ label }</FormLabel>
				<div className='col-9'>
					<input
						ref={ node => this.input = node }
						type='hidden'
						name={ input.name }
						value={ this.nativeValue }
					/>
					<select
						className={ classNames({
							'form-control': true,
							'is-invalid': meta && meta.touched && (meta.warning || meta.error),
							'is-valid': this.nativeValue && (!meta || (!meta.warning && !meta.error))
						}) }
						value={ this.nativeValue }
						multiple={ multiple }
						onBlur={ this.handleBlur }
						onChange={ this.handleChange }
					>
						{ !multiple && <option /> }
						{ options.map(({ label: optionLabel, value: optionValue }) => (
							<option
								key={ optionValue }
								value={ optionValue }
								title={ optionLabel }
							>
								{ optionLabel }
							</option>
						)) }
					</select>
					<InvalidFeedback meta={ meta } />
				</div>
			</div>
		);
	}
}
