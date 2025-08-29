import { 
  Globe, 
  Scale, 
  Link, 
  Radio, 
  Zap, 
  Shield 
} from 'lucide-react'

export const CATEGORIES = {
  dns: {
    name: 'DNS Resolution',
    icon: Globe,
    description: 'Learn how Domain Name System translates domain names to IP addresses',
    color: 'from-blue-500 to-cyan-500'
  },
  loadbalancer: {
    name: 'Load Balancer',
    icon: Scale,
    description: 'Understand how load balancers distribute traffic across servers',
    color: 'from-green-500 to-emerald-500'
  },
  tcp: {
    name: 'TCP Connection',
    icon: Link,
    description: 'Visualize TCP handshake and connection establishment',
    color: 'from-purple-500 to-pink-500'
  },
  http: {
    name: 'HTTP Request',
    icon: Radio,
    description: 'See how HTTP requests and responses work',
    color: 'from-orange-500 to-red-500'
  },
  cdn: {
    name: 'CDN Network',
    icon: Zap,
    description: 'Learn how Content Delivery Networks speed up web delivery',
    color: 'from-indigo-500 to-blue-500'
  },
  vpn: {
    name: 'VPN Tunnel',
    icon: Shield,
    description: 'Understand how VPN creates secure tunnels',
    color: 'from-teal-500 to-cyan-500'
  }
}

export const DNS_STEPS = [
  { 
    id: 1, 
    name: 'Browser Cache', 
    description: 'Check local DNS cache', 
    status: 'pending',
    duration: 4000,
    detailedInfo: 'The browser first checks its local DNS cache to see if it recently resolved this domain. This is the fastest option as it doesn\'t require any network requests. Modern browsers typically cache DNS records for 1-30 minutes.'
  },
  { 
    id: 2, 
    name: 'OS Cache', 
    description: 'Check operating system cache', 
    status: 'pending',
    duration: 4200,
    detailedInfo: 'If not found in browser cache, the OS checks its DNS resolver cache. The operating system maintains its own DNS cache that\'s shared between all applications. This cache typically stores records for longer periods.'
  },
  { 
    id: 3, 
    name: 'Router Cache', 
    description: 'Check router DNS cache', 
    status: 'pending',
    duration: 3800,
    detailedInfo: 'Your local router/modem also maintains a DNS cache. This helps reduce queries to external DNS servers for all devices in your network. Most home routers cache DNS records for several hours.'
  },
  { 
    id: 4, 
    name: 'ISP DNS', 
    description: 'Query ISP DNS server', 
    status: 'pending',
    duration: 5500,
    detailedInfo: 'If no local cache has the record, your device queries your ISP\'s DNS servers (like 8.8.8.8 or your ISP\'s servers). These servers have large caches and handle millions of queries daily.'
  },
  { 
    id: 5, 
    name: 'Root Server', 
    description: 'Query root nameserver', 
    status: 'pending',
    duration: 6000,
    detailedInfo: 'If the ISP doesn\'t have the record, it queries one of the 13 root nameservers worldwide. Root servers don\'t know the final IP but can direct to the appropriate Top-Level Domain (TLD) server.'
  },
  { 
    id: 6, 
    name: 'TLD Server', 
    description: 'Query top-level domain server', 
    status: 'pending',
    duration: 5800,
    detailedInfo: 'The TLD server (like .com, .org, .net servers) knows which authoritative nameserver is responsible for the specific domain. It responds with the authoritative nameserver\'s address.'
  },
  { 
    id: 7, 
    name: 'Authoritative', 
    description: 'Query authoritative nameserver', 
    status: 'pending',
    duration: 5600,
    detailedInfo: 'The authoritative nameserver is the final source of truth for the domain. It contains the actual DNS records (A, AAAA, MX, CNAME, etc.) and responds with the requested IP address.'
  },
  { 
    id: 8, 
    name: 'Response', 
    description: 'Return IP address', 
    status: 'pending',
    duration: 5500,
    detailedInfo: 'The IP address is returned back through the chain: Authoritative → TLD → Root → ISP → Router → OS → Browser. Each level caches the result for future queries, making subsequent requests much faster.'
  }
]

export const LOAD_BALANCER_ALGORITHMS = [
  { name: 'Round Robin', description: 'Requests distributed sequentially' },
  { name: 'Least Connections', description: 'Route to server with fewest connections' },
  { name: 'Weighted', description: 'Route based on server capacity weights' },
  { name: 'IP Hash', description: 'Route based on client IP hash' }
]

export const SERVER_STATUS = {
  healthy: { color: 'bg-green-500', pulse: 'animate-pulse' },
  warning: { color: 'bg-yellow-500', pulse: 'animate-pulse' },
  error: { color: 'bg-red-500', pulse: 'animate-bounce' },
  offline: { color: 'bg-gray-500', pulse: '' }
}