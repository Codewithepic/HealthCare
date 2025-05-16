import { useState, useEffect } from 'react';
import { runDatabaseChecks } from '@/utils/databaseCheckEnhanced';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Database, RefreshCw, User, FileText, Shield, Code } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface CheckResultProps {
  isLoading: boolean;
  result: any;
  title: string;
  icon: React.ReactNode;
}

const CheckResult = ({ isLoading, result, title, icon }: CheckResultProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span>Checking {title.toLowerCase()}...</span>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex items-center space-x-2">
        <AlertCircle className="h-4 w-4 text-muted-foreground" />
        <span>No data available</span>
      </div>
    );
  }
  const isSuccess = result.connected || result.exists || result.success || result.active;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {icon}
          <span className="font-medium">{title}</span>
        </div>
        <Badge variant={isSuccess ? "default" : "destructive"}>
          {isSuccess ? "Success" : "Failed"}
        </Badge>
      </div>
      
      <Alert variant={isSuccess ? "default" : "destructive"}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{isSuccess ? "Success" : "Error"}</AlertTitle>
        <AlertDescription>
          {result.message}
          {result.warning && (
            <div className="mt-2 text-yellow-500">{result.warning}</div>
          )}
        </AlertDescription>
      </Alert>
      
      {isSuccess && result.currentUser && (
        <div className="mt-2">
          <p className="text-sm font-medium mb-1">Current User:</p>
          <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
            {JSON.stringify({
              id: result.currentUser.id,
              email: result.currentUser.email,
              auth_provider: result.currentUser.app_metadata?.provider,
              created_at: result.currentUser.created_at,
            }, null, 2)}
          </pre>
        </div>
      )}
      
      {isSuccess && result.session && (
        <div className="mt-2">
          <p className="text-sm font-medium mb-1">Session Details:</p>
          <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
            {JSON.stringify({
              user_id: result.session.user.id,
              email: result.session.user.email,
              expires_at: new Date(result.session.expires_at * 1000).toLocaleString(),
            }, null, 2)}
          </pre>
        </div>
      )}
      
      {isSuccess && result.sampleRecords && result.sampleRecords.length > 0 && (
        <div className="mt-2">
          <p className="text-sm font-medium mb-1">Sample Data:</p>
          <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
            {JSON.stringify(result.sampleRecords, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

const DatabaseStatus = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const checkDatabase = async () => {
    setIsChecking(true);
    setError(null);
    
    try {
      const checkResults = await runDatabaseChecks();
      setResults(checkResults);
    } catch (err) {
      console.error('Error running database checks:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkDatabase();
  }, []);

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Status Check
        </CardTitle>
        <CardDescription>
          Checks if your Supabase database is properly connected and contains data
        </CardDescription>
      </CardHeader>      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
          <CheckResult 
          isLoading={isChecking} 
          result={results?.connection} 
          title="Database Connection" 
          icon={<Database className="h-4 w-4" />} 
        />
        
        <CheckResult 
          isLoading={isChecking} 
          result={results?.session} 
          title="Authentication Session" 
          icon={<Shield className="h-4 w-4" />} 
        />
        
        <CheckResult 
          isLoading={isChecking} 
          result={results?.records} 
          title="Medical Records" 
          icon={<FileText className="h-4 w-4" />} 
        />
        
        <CheckResult 
          isLoading={isChecking} 
          result={results?.users} 
          title="User Accounts" 
          icon={<User className="h-4 w-4" />} 
        />
        
        {results?.schema && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <Code className="mr-2 h-5 w-5" />
              Database Schema Analysis
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(results.schema.tables || {}).map(([tableName, tableInfo]: [string, any]) => (
                  <div key={tableName} className="p-3 border rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{tableName}</span>
                      <Badge variant={tableInfo.exists ? "default" : "destructive"}>
                        {tableInfo.exists ? "Exists" : "Missing"}
                      </Badge>
                    </div>
                    {tableInfo.error && (
                      <p className="text-xs text-destructive mt-1">{tableInfo.error.message}</p>
                    )}
                  </div>
                ))}
              </div>
                {!isChecking && Object.values(results.schema.tables || {}).some((info: any) => !info.exists) && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Suggested SQL to Create Missing Tables</h4>
                  <div className="bg-zinc-950 text-zinc-200 p-4 rounded-md overflow-auto max-h-96">
                    <pre className="text-xs">{results.schema.suggestedSQL}</pre>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    You can run this SQL in your Supabase SQL Editor to create the missing tables.
                  </p>
                  <div className="mt-4 p-4 border rounded-md bg-blue-50 dark:bg-blue-950">
                    <h4 className="font-medium mb-2">How to Set Up Your Supabase Database</h4>
                    <ol className="text-xs space-y-2 list-decimal pl-4">
                      <li>Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">Supabase.com</a> and sign in or create an account</li>
                      <li>Create a new project if you don't already have one</li>
                      <li>Copy your project URL and anon key from the API settings page</li>
                      <li>Create a <code className="bg-muted px-1 rounded">.env</code> file in your project root with:
                        <pre className="bg-muted p-2 rounded mt-1">
VITE_SUPABASE_URL=your_project_url<br/>
VITE_SUPABASE_ANON_KEY=your_anon_key
                        </pre>
                      </li>
                      <li>Go to the SQL Editor in your Supabase dashboard</li>
                      <li>Paste the SQL code above and run it to create the tables</li>
                      <li>Restart your development server</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={checkDatabase} 
          disabled={isChecking}
          className="flex items-center gap-2"
        >
          {isChecking ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {isChecking ? 'Checking...' : 'Run Checks Again'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DatabaseStatus;
