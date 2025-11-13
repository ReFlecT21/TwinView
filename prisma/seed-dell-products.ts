import { PrismaClient, DellProductCategory, ValueChainStage } from '@prisma/client';

const prisma = new PrismaClient();

const dellProducts = [
  // Data Capture & Ingestion Products
  {
    name: "NativeEdge Gateways",
    category: DellProductCategory.NATIVE_EDGE_GATEWAYS,
    valueChainStage: ValueChainStage.DATA_CAPTURE_INGESTION,
    description: "Dell NativeEdge is an edge operations software platform that simplifies the deployment, security, and management of edge infrastructure and applications at scale.",
    features: [
      "Zero-touch deployment",
      "Centralized management",
      "Real-time monitoring",
      "Security at the edge",
      "Multi-cloud connectivity"
    ],
    specifications: {
      deployment: "On-premises, edge locations",
      scalability: "Thousands of edge locations",
      protocols: ["MQTT", "OPC UA", "Modbus", "REST APIs"],
      security: "End-to-end encryption, secure boot"
    },
    targetIndustries: ["Manufacturing", "Retail", "Healthcare", "Smart Cities"],
    useCases: [
      {
        title: "Factory Floor Data Collection",
        description: "Collect and process sensor data from manufacturing equipment"
      },
      {
        title: "Retail Store Analytics",
        description: "Edge-based video analytics and inventory management"
      }
    ],
    productUrl: "https://www.dell.com/en-us/dt/solutions/edge-computing/index.htm"
  },
  {
    name: "IoT Connect",
    category: DellProductCategory.IOT_CONNECT,
    valueChainStage: ValueChainStage.DATA_CAPTURE_INGESTION,
    description: "Comprehensive IoT connectivity solution for device management and data ingestion at scale.",
    features: [
      "Device provisioning",
      "Protocol translation",
      "Data filtering and aggregation",
      "Real-time streaming",
      "Device lifecycle management"
    ],
    specifications: {
      supportedDevices: "10,000+ device types",
      protocols: ["MQTT", "CoAP", "HTTP/HTTPS", "WebSocket"],
      dataFormats: ["JSON", "XML", "Binary", "Protobuf"]
    },
    targetIndustries: ["Industrial IoT", "Smart Buildings", "Agriculture", "Energy"],
    useCases: [
      {
        title: "Sensor Network Management",
        description: "Connect and manage thousands of IoT sensors"
      },
      {
        title: "Predictive Maintenance",
        description: "Collect equipment data for maintenance predictions"
      }
    ]
  },

  // Edge Processing Products
  {
    name: "PowerEdge XE Servers",
    category: DellProductCategory.POWEREDGE_XE,
    valueChainStage: ValueChainStage.EDGE_PROCESSING,
    description: "Ruggedized servers designed for harsh edge environments with powerful computing capabilities.",
    features: [
      "Ruggedized design for extreme conditions",
      "Compact form factor",
      "GPU acceleration support",
      "Low latency processing",
      "5G ready"
    ],
    specifications: {
      temperatureRange: "-40°C to 70°C",
      processors: "Intel Xeon or AMD EPYC",
      memory: "Up to 1TB DDR4",
      storage: "NVMe SSDs up to 30TB",
      accelerators: "NVIDIA T4, A2 GPUs"
    },
    targetIndustries: ["Telecommunications", "Manufacturing", "Oil & Gas", "Defense"],
    useCases: [
      {
        title: "5G Network Edge",
        description: "Process 5G workloads at the network edge"
      },
      {
        title: "Computer Vision at Edge",
        description: "Real-time video analytics and AI inference"
      }
    ],
    productUrl: "https://www.dell.com/en-us/shop/servers-storage-and-networking/poweredge-xe-servers/spd/poweredge-xe-servers"
  },
  {
    name: "Edge Servers",
    category: DellProductCategory.EDGE_SERVERS,
    valueChainStage: ValueChainStage.EDGE_PROCESSING,
    description: "Versatile edge computing servers for distributed processing and analytics.",
    features: [
      "Modular design",
      "Remote management",
      "Virtualization support",
      "Container orchestration",
      "Edge analytics"
    ],
    specifications: {
      formFactors: ["1U", "2U", "Tower"],
      connectivity: "Dual 10/25GbE, Wi-Fi 6",
      virtualization: "VMware, Hyper-V, KVM",
      containers: "Kubernetes, Docker"
    },
    targetIndustries: ["Retail", "Healthcare", "Education", "Financial Services"],
    useCases: [
      {
        title: "Branch Office Computing",
        description: "Local compute for branch locations"
      },
      {
        title: "Edge AI Workloads",
        description: "Run AI models closer to data sources"
      }
    ]
  },

  // Storage & Management Products
  {
    name: "PowerScale",
    category: DellProductCategory.POWER_SCALE,
    valueChainStage: ValueChainStage.STORAGE_MANAGEMENT,
    description: "Scale-out NAS storage platform for unstructured data and demanding file workloads.",
    features: [
      "Massive scalability",
      "Multi-protocol support",
      "Data tiering",
      "Cloud integration",
      "Data protection"
    ],
    specifications: {
      capacity: "Up to 100PB per cluster",
      throughput: "Up to 1.5TB/s",
      protocols: ["NFS", "SMB", "HDFS", "S3"],
      nodes: "3 to 252 nodes per cluster"
    },
    targetIndustries: ["Media & Entertainment", "Life Sciences", "Manufacturing", "Energy"],
    useCases: [
      {
        title: "Digital Twin Data Lake",
        description: "Store and manage massive Digital Twin datasets"
      },
      {
        title: "AI/ML Data Repository",
        description: "High-performance storage for AI training data"
      }
    ],
    productUrl: "https://www.dell.com/en-us/dt/storage/powerscale.htm"
  },
  {
    name: "PowerStore",
    category: DellProductCategory.POWERSTORE,
    valueChainStage: ValueChainStage.STORAGE_MANAGEMENT,
    description: "Intelligent and adaptable infrastructure platform for traditional and modern workloads.",
    features: [
      "Container-native",
      "AppsON integration",
      "Automated optimization",
      "Built-in machine learning",
      "Flexible architecture"
    ],
    specifications: {
      capacity: "Up to 18.8PB effective",
      performance: "Up to 2.8M IOPS",
      reduction: "4:1 average data reduction",
      availability: "99.9999% availability"
    },
    targetIndustries: ["Financial Services", "Healthcare", "Government", "Retail"],
    useCases: [
      {
        title: "Mission-Critical Databases",
        description: "High-performance storage for critical applications"
      },
      {
        title: "Virtual Desktop Infrastructure",
        description: "Support thousands of virtual desktops"
      }
    ],
    productUrl: "https://www.dell.com/en-us/dt/storage/powerstore-storage-appliance.htm"
  },
  {
    name: "PowerProtect",
    category: DellProductCategory.POWERPROTECT,
    valueChainStage: ValueChainStage.STORAGE_MANAGEMENT,
    description: "Comprehensive data protection and backup solution for Digital Twin environments.",
    features: [
      "Cyber recovery",
      "Cloud disaster recovery",
      "Deduplication",
      "Encryption",
      "Multi-cloud protection"
    ],
    specifications: {
      capacity: "Up to 1.5PB logical capacity",
      deduplication: "Up to 65:1",
      throughput: "Up to 68TB/hr",
      cloudSupport: ["AWS", "Azure", "Google Cloud", "Dell APEX"]
    },
    targetIndustries: ["All Industries"],
    useCases: [
      {
        title: "Digital Twin Backup",
        description: "Protect Digital Twin models and data"
      },
      {
        title: "Ransomware Recovery",
        description: "Isolated recovery environment for cyber attacks"
      }
    ],
    productUrl: "https://www.dell.com/en-us/dt/data-protection/powerprotect-backup-appliances.htm"
  },

  // Compute & Simulation Products
  {
    name: "PowerEdge GPU Servers",
    category: DellProductCategory.POWEREDGE_GPU,
    valueChainStage: ValueChainStage.COMPUTE_SIMULATION,
    description: "High-performance GPU-accelerated servers for AI, ML, and simulation workloads.",
    features: [
      "Multiple GPU support",
      "Optimized cooling",
      "High-speed interconnects",
      "AI-optimized configurations",
      "Deep learning frameworks"
    ],
    specifications: {
      gpus: "Up to 10 NVIDIA A100/H100 GPUs",
      memory: "Up to 8TB DDR4",
      interconnect: "NVIDIA NVLink, InfiniBand",
      processors: "Dual Intel Xeon or AMD EPYC"
    },
    targetIndustries: ["Automotive", "Aerospace", "Energy", "Research"],
    useCases: [
      {
        title: "Digital Twin Simulation",
        description: "Complex physics simulations for Digital Twins"
      },
      {
        title: "AI Model Training",
        description: "Train large-scale AI models"
      }
    ],
    productUrl: "https://www.dell.com/en-us/shop/servers-storage-and-networking/sf/poweredge-rack-servers"
  },
  {
    name: "AI Factory",
    category: DellProductCategory.AI_FACTORY,
    valueChainStage: ValueChainStage.COMPUTE_SIMULATION,
    description: "Turnkey AI infrastructure solution combining compute, storage, and networking for enterprise AI.",
    features: [
      "Pre-validated designs",
      "Scalable architecture",
      "MLOps integration",
      "Automated deployment",
      "Performance optimization"
    ],
    specifications: {
      compute: "PowerEdge XE9680 servers",
      gpus: "NVIDIA H100 Tensor Core GPUs",
      networking: "NVIDIA Quantum-2 InfiniBand",
      storage: "PowerScale or PowerStore"
    },
    targetIndustries: ["All Industries"],
    useCases: [
      {
        title: "Enterprise AI Platform",
        description: "Complete AI infrastructure for enterprise"
      },
      {
        title: "Digital Twin AI Models",
        description: "Train and deploy Digital Twin AI models"
      }
    ],
    productUrl: "https://www.dell.com/en-us/dt/solutions/artificial-intelligence/index.htm"
  },
  {
    name: "Omniverse (NVIDIA Partner)",
    category: DellProductCategory.OMNIVERSE_NVIDIA,
    valueChainStage: ValueChainStage.COMPUTE_SIMULATION,
    description: "NVIDIA Omniverse platform for creating and operating metaverse applications and 3D workflows.",
    features: [
      "Real-time ray tracing",
      "Physics simulation",
      "Collaborative design",
      "USD-based workflows",
      "AI integration"
    ],
    specifications: {
      platform: "NVIDIA Omniverse Enterprise",
      rendering: "RTX ray tracing",
      formats: ["USD", "FBX", "glTF", "OBJ"],
      collaboration: "Multi-user real-time"
    },
    targetIndustries: ["Manufacturing", "Architecture", "Media", "Automotive"],
    useCases: [
      {
        title: "Digital Twin Visualization",
        description: "Photo-realistic Digital Twin rendering"
      },
      {
        title: "Virtual Factory Planning",
        description: "Design and simulate factory layouts"
      }
    ],
    productUrl: "https://www.nvidia.com/en-us/omniverse/"
  },

  // Visualization & Decision Products
  {
    name: "Cloud Integration Platform",
    category: DellProductCategory.CLOUD_INTEGRATION,
    valueChainStage: ValueChainStage.VISUALIZATION_DECISION,
    description: "Hybrid and multi-cloud integration platform for Digital Twin deployments.",
    features: [
      "Multi-cloud management",
      "API orchestration",
      "Data synchronization",
      "Security policies",
      "Cost optimization"
    ],
    specifications: {
      cloudProviders: ["AWS", "Azure", "Google Cloud", "Dell APEX"],
      integration: "REST APIs, GraphQL",
      compliance: ["GDPR", "HIPAA", "SOC 2"],
      orchestration: "Kubernetes, Terraform"
    },
    targetIndustries: ["All Industries"],
    useCases: [
      {
        title: "Hybrid Digital Twin",
        description: "Deploy Digital Twins across cloud and edge"
      },
      {
        title: "Cloud Bursting",
        description: "Scale compute to cloud during peak demand"
      }
    ]
  },
  {
    name: "Display Solutions",
    category: DellProductCategory.DISPLAYS,
    valueChainStage: ValueChainStage.VISUALIZATION_DECISION,
    description: "High-resolution displays and video walls for Digital Twin visualization.",
    features: [
      "4K/8K resolution",
      "HDR support",
      "Touch capability",
      "Video wall support",
      "Remote management"
    ],
    specifications: {
      sizes: "24\" to 86\"",
      resolution: "Up to 8K",
      refreshRate: "Up to 240Hz",
      connectivity: "HDMI 2.1, DisplayPort 1.4, USB-C"
    },
    targetIndustries: ["Command Centers", "Manufacturing", "Utilities", "Smart Cities"],
    useCases: [
      {
        title: "Control Room Displays",
        description: "Monitor Digital Twin operations in real-time"
      },
      {
        title: "Collaborative Design Reviews",
        description: "Large format displays for design collaboration"
      }
    ],
    productUrl: "https://www.dell.com/en-us/shop/monitors"
  },
  {
    name: "Analytics Platform",
    category: DellProductCategory.ANALYTICS_PLATFORM,
    valueChainStage: ValueChainStage.VISUALIZATION_DECISION,
    description: "Advanced analytics platform for Digital Twin insights and decision support.",
    features: [
      "Real-time analytics",
      "Predictive modeling",
      "Custom dashboards",
      "Alert management",
      "Report generation"
    ],
    specifications: {
      dataConnectors: "100+ data source connectors",
      visualization: "D3.js, Plotly, custom widgets",
      ml: "AutoML, custom models",
      deployment: "Cloud, on-premises, hybrid"
    },
    targetIndustries: ["All Industries"],
    useCases: [
      {
        title: "Operational Intelligence",
        description: "Real-time insights from Digital Twin data"
      },
      {
        title: "Predictive Analytics",
        description: "Predict outcomes using Digital Twin models"
      }
    ]
  }
];

async function seedDellProducts() {
  console.log('🚀 Starting Dell Products seed...');

  try {
    // Clear existing Dell Products (optional - comment out if you want to keep existing)
    await prisma.dellProduct.deleteMany({});
    console.log('✅ Cleared existing Dell Products');

    // Insert new Dell Products
    for (const product of dellProducts) {
      const created = await prisma.dellProduct.create({
        data: product
      });
      console.log(`✅ Created Dell Product: ${created.name}`);
    }

    console.log(`\n✅ Successfully seeded ${dellProducts.length} Dell Products!`);

    // Display summary by value chain stage
    const stages = await prisma.dellProduct.groupBy({
      by: ['valueChainStage'],
      _count: true,
    });

    console.log('\n📊 Products by Value Chain Stage:');
    stages.forEach(stage => {
      console.log(`  ${stage.valueChainStage}: ${stage._count} products`);
    });

  } catch (error) {
    console.error('❌ Error seeding Dell Products:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the seed function
seedDellProducts()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });