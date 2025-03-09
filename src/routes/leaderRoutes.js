import LeaderLayout from '../pages/leader/LeaderLayout';
import LeaderHome from '../pages/leader/LeaderHome';
import LeaderDelivery from '../pages/leader/LeaderDelivery';
import LeaderService from '../pages/leader/LeaderService';
import LeaderProfile from '../pages/leader/LeaderProfile';

const leaderRoutes = {
  path: '/leader',
  element: <LeaderLayout />,
  children: [
    {
      path: '',
      element: <LeaderHome />
    },
    {
      path: 'delivery',
      element: <LeaderDelivery />
    },
    {
      path: 'service',
      element: <LeaderService />
    },
    {
      path: 'profile',
      element: <LeaderProfile />
    }
  ]
};

export default leaderRoutes;
