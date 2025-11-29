import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const TestEdit = () => {
  const { user, session } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [testName, setTestName] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const { data, error } = await supabase.from('projects').select('*').limit(1);
    if (error) {
      console.error('Load error:', error);
      toast({
        title: "Error loading",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setProjects(data || []);
      if (data && data.length > 0) {
        setSelectedProject(data[0]);
        setTestName(data[0].engineer_name);
      }
    }
  };

  const testUpdate = async () => {
    if (!selectedProject) {
      toast({
        title: "No project selected",
        description: "Please load a project first",
        variant: "destructive",
      });
      return;
    }

    console.log('=== UPDATE TEST START ===');
    console.log('User:', user);
    console.log('Session:', session);
    console.log('Project ID:', selectedProject.id);
    console.log('Current engineer_name:', selectedProject.engineer_name);
    console.log('New engineer_name:', testName);

    try {
      const { data, error } = await supabase
        .from('projects')
        .update({ engineer_name: testName })
        .eq('id', selectedProject.id)
        .select();

      console.log('Update response:', { data, error });

      if (error) {
        console.error('Update ERROR:', error);
        toast({
          title: "❌ Update Failed",
          description: `${error.message} (Code: ${error.code})`,
          variant: "destructive",
        });
      } else {
        console.log('✅ Update SUCCESS:', data);
        toast({
          title: "✅ Update Successful!",
          description: `Updated to: ${testName}`,
        });
        loadProjects();
      }
    } catch (err: any) {
      console.error('Exception:', err);
      toast({
        title: "Exception occurred",
        description: err.message,
        variant: "destructive",
      });
    }

    console.log('=== UPDATE TEST END ===');
  };

  const testPermissions = async () => {
    console.log('=== PERMISSION TEST ===');
    console.log('User authenticated:', !!user);
    console.log('User ID:', user?.id);
    console.log('User role:', user?.role);
    console.log('Session exists:', !!session);

    // Test current session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    console.log('Current session:', { 
      hasSession: !!sessionData.session, 
      userId: sessionData.session?.user?.id,
      error: sessionError 
    });

    // Test table permissions
    const { data: selectTest, error: selectError } = await supabase
      .from('projects')
      .select('id')
      .limit(1);
    console.log('SELECT test:', { success: !selectError, error: selectError });

    const { data: updateTest, error: updateError } = await supabase
      .from('projects')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', '00000000-0000-0000-0000-000000000000') // Fake ID
      .select();
    console.log('UPDATE test:', { success: !updateError, error: updateError });

    console.log('=== PERMISSION TEST END ===');
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Functionality Test Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-semibold">Authentication Status</h3>
            <div className="bg-muted p-3 rounded text-sm font-mono space-y-1">
              <div>User: {user ? '✅ Logged in' : '❌ Not logged in'}</div>
              <div>Email: {user?.email || 'N/A'}</div>
              <div>User ID: {user?.id || 'N/A'}</div>
              <div>Session: {session ? '✅ Active' : '❌ None'}</div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Selected Project</h3>
            {selectedProject ? (
              <div className="bg-muted p-3 rounded text-sm font-mono space-y-1">
                <div>ID: {selectedProject.id}</div>
                <div>Project ID: {selectedProject.project_id}</div>
                <div>Engineer: {selectedProject.engineer_name}</div>
                <div>Branch: {selectedProject.branch}</div>
              </div>
            ) : (
              <div className="text-muted-foreground">No project loaded</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="testName">Test New Engineer Name</Label>
            <Input
              id="testName"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              placeholder="Enter new name to test update"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={loadProjects} variant="outline">
              Reload Project
            </Button>
            <Button onClick={testPermissions} variant="outline">
              Test Permissions
            </Button>
            <Button onClick={testUpdate} disabled={!selectedProject}>
              Test Update
            </Button>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded">
            <h4 className="font-semibold mb-2">How to Use:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Make sure you're signed in as admin</li>
              <li>Click "Reload Project" to load a test project</li>
              <li>Change the "Test New Engineer Name" field</li>
              <li>Click "Test Update" to attempt the update</li>
              <li>Check browser console for detailed logs</li>
              <li>If update fails, click "Test Permissions" to debug</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestEdit;

