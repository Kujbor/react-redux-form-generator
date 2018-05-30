import { Component } from 'react';

export default class BlockWrapper extends Component {

	render() {

		const { title, caption, children, fields, ...props } = this.props;

		return (
			<div { ...props } className='card bg-light mb-3'>
				<div className='card-body'>
					{ title && <h3>{ title }</h3> }
					{ caption && <p>{ caption }</p> }
					{ children }
				</div>
			</div>
		);
	}
};