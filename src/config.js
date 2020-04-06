const IS_DEPLOYED = true;

// URI of backend server - if deployed, point to EC2
// otherwise, for local development, point at your
// localhost server.
const SERVER_URI = IS_DEPLOYED
  ? 'http://ec2-3-86-32-191.compute-1.amazonaws.com'
  : 'http://localhost:80';
