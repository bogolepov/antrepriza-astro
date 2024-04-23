export default function CartButton({ count }) {
	let handleClick = () => {
		alert('Yes');
	};
	return (
		<button className='cart-button' onClick={handleClick} hidden={count === 0}>
			{count}
		</button>
	);
}
