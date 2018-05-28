import { Component } from 'react';
import classNames from 'classnames';

import FormLabel from './FormLabel';
import InvalidFeedback from './InvalidFeedback';

export default class RadioField extends Component {

	render() {

		const { meta, input, label, options } = this.props;

		options.forEach(option => option.label = option.label || option.value);

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