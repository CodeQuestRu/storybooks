import React from 'react';

import AutoComplete from './AutoComplete';

export default {
  title: 'AutoComplete',
  component: AutoComplete
}

const Template = args => <AutoComplete {...args} />

export const Default = Template.bind({});
Default.args = {};