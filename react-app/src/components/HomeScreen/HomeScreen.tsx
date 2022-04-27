import React from 'react';
import LocalizedText from '../Localized/LocalizedText';

const HomeScreen: React.FC = () => {
	return (
		<div>
			<LocalizedText messageID='App.title'/>
		</div>
	)
}

export default HomeScreen;