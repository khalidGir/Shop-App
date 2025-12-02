import Loader from './Loader';

export default {
  title: 'Components/Loader',
  component: Loader,
  parameters: {
    backgrounds: {
      default: 'light',
    },
  },
};

export const Default = {
  render: () => <Loader />,
};