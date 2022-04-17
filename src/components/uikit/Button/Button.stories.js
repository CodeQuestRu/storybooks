import React from 'react';

import Button from './Button';

export default {
  title: 'Button',
  component: Button
}

const Template = args => <Button {...args} />

export const Default = Template.bind({});
Default.args = {
  children: 'Кнопка'
};

export const Primary = Template.bind({});
Primary.args = {
  children: 'Кнопка',
  type: "primary"
};

export const Danger = Template.bind({});
Danger.args = {
  children: 'Кнопка',
  type: "primary",
  danger: true
};