import { trpc } from '../../lib/trpc';

export function TrpcExample() {
  const utils = trpc.useUtils();

  // Use tRPC to fetch companies
  const { data: companies, isLoading, error } = trpc.companies.getAll.useQuery();

  // Mutation to create a new company
  const createCompanyMutation = trpc.companies.create.useMutation({
    onSuccess: () => {
      // Invalidate and refetch companies
      utils.companies.getAll.invalidate();
    },
  });

  const handleCreateCompany = () => {
    createCompanyMutation.mutate({
      name: "Example Company",
      industry: "Technology",
      country: "USA",
      digitalTwinStatus: "not_started",
      digitalTwinMaturity: 0,
      opportunityScore: 0,
    });
  };

  if (isLoading) return <div>Loading companies...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">tRPC Example</h2>

      <button
        onClick={handleCreateCompany}
        disabled={createCompanyMutation.isPending}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {createCompanyMutation.isPending ? 'Creating...' : 'Create Example Company'}
      </button>

      <div>
        <h3 className="text-lg font-semibold mb-2">Companies ({companies?.length})</h3>
        <div className="space-y-2">
          {companies?.map((company) => (
            <div key={company.id} className="p-3 border rounded">
              <h4 className="font-medium">{company.name}</h4>
              <p className="text-sm text-gray-600">{company.industry} • {company.country}</p>
              <p className="text-sm">Status: {company.digitalTwinStatus}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}