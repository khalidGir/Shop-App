import Header from './Header';

export default {
  title: 'Components/Header',
  component: Header,
  parameters: {
    backgrounds: {
      default: 'light',
    },
  },
};

export const Default = {
  render: () => <Header />,
};