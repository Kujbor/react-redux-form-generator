import { PureComponent } from 'react';

export default class FieldWrapper extends PureComponent {

	render() {

		const { children, half, ...props } = this.props;

		return <div { ...props }>{ children }</div>;
	}
}
