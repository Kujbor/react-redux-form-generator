import { Component } from 'react';
import propTypes from 'prop-types';
import classNames from 'classnames';

import log from '../utils/log';
import FormLabel from './FormLabel';
import InvalidFeedback from './InvalidFeedback';

export default class RadioField extends Component {

	static propTypes = {
		type: propTypes.string.isRequired,
		meta: propTypes.object.isRequired,
		input: propTypes.object.isRequired,
		label: propTypes.string,
		extra: propTypes.object,
		options: propTypes.array.isRequired
	};

	static defaultProps = {
		label: '',
		extra: {}
	};

	render() {

		const { type, meta, input, label, extra, options } = this.props;

		options.forEach(option => option.label = option.label || option.value);

		log('RadioField -> render', { input });

		return (
			<div className='form-group row'>
				<FormLabel meta={ meta } input={ input }>{ label }</FormLabel>
				<div className='col-9'>
					{ options.map(option => (
						<div key={ option.value } className='form-check'>
							<label className='form-check-label'>
								<input
									className={ classNames({
										'form-check-input': true,
										'is-invalid': meta && meta.touched && (meta.warning || meta.error),
										'is-valid': input.value && (!meta || (!meta.warning && !meta.error))
									}) }
									type='radio'
									name={ input.name }
									value={ option.value }
									checked={ option.value === input.value }
									onChange={ input.onChange }
								/>
								&nbsp;
								{ option.label }
							</label>
						</div>
					)) }
					<InvalidFeedback meta={ meta } />
				</div>
			</div>
		);
	}
};