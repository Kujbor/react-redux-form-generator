import { Component } from 'react';
import propTypes from 'prop-types';
import classNames from 'classnames';

import FormLabel from './FormLabel';
import InvalidFeedback from './InvalidFeedback';
import inputClassNames from '../utils/inputClassNames';

export default class ButtonsField extends Component {

	static propTypes = {
		meta: propTypes.object.isRequired,
		input: propTypes.object.isRequired,
		label: propTypes.string,
		options: propTypes.array
	};

	static defaultProps = {
		label: '',
		options: []
	};

	onChange = ({ target: { value } }) => this.setInputValue('onChange', value)

	handleBlur = () => this.handleNoopEvent('onBlur');
	handleFocus = () => this.handleNoopEvent('onFocus');

	handleNoopEvent = enentType => {

		const { input: { value } } = this.props;

		this.setInputValue(enentType, value);
	}

	setInputValue = (eventType, value) => {

		const { input: { [eventType]: eventHandler, name } } = this.props;

		// log('ButtonsField -> setInputValue', { eventType, value, name });

		eventHandler({
			preventDefault: () => {},
			stopPropagation: () => {},
			target: Object.assign(this.input, { value: value || null })
		});
	}

	render() {

		const { type, meta, input, label, options } = this.props;

		options.forEach(option => option.label = option.label || option.value);

		log('ButtonsField -> render', { type, meta, input, label, options });

		return (
			<div className='form-group row'>
				<FormLabel meta={ meta } input={ input }>{ label }</FormLabel>
				<input
					ref={ node => this.input = node }
					type='hidden'
					name={ input.name }
					value={ input.value }
				/>
				<div className='col-9'>
					<div
						className={ classNames({
							'btn-group': true,
							'btn-group-danger': meta && meta.touched && (meta.warning || meta.error)
						}) }
					>
						{ options.map(option => (
							<button
								key={ option.value }
								type='button'
								className={ classNames({
									btn: true,
									'btn-lg': true,
									'btn-secondary': option.value !== input.value,
									'btn-dark': option.value === input.value,
									'btn-danger': meta && meta.touched && (meta.warning || meta.error)
								}) }
								value={ option.value }
								onClick={ this.onChange }
								onBlur={ this.handleBlur }
								onFocus={ this.handleFocus }
							>
								{ option.label }
							</button>
						)) }
					</div>
					<InvalidFeedback meta={ meta } />
				</div>
			</div>
		);
	}
}
