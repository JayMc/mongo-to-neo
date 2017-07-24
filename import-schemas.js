module.exports = [
	{
		name: 'cat',
		type: 'cat',
		mongoCollection: 'cats',
		fields: ['_id', 'name'],
		query: [
			{ '$match': { colour: 'black'} },
			{ '$project': {'name': 1} },
		],
		toStrings: ['_id'],
		onlyRelationships: false,
		relationships: [
		{
			name: 'SLEEPS_ON',
			a: {
				type: 'furniture',
				key: '_id',
				rowKey: '_id',
			},
			b: {
				type: 'cat',
				key: '_id',
				rowKey: '_id',
			},
			direction: {
				a: '<',
				b: '',
			}
		}],
	},

	{
		name: 'furniture',
		type: 'furniture',
		mongoCollection: 'furnitures',
		fields: ['_id', 'price'],
		query: [
			{ '$match': {} },
			{ '$project': {'_id': 1, 'price': 1} },
		],
		toStrings: ['_id'],
		onlyRelationships: false,
		relationships: [],
	},
];
