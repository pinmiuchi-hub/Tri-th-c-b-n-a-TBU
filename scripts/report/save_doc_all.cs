// Save a specific open document in ANY running Word instance.
// Usage: save_doc_all.exe <srcFullPath|name> <dst|-|> [fmt]
//   dst '-' = probe only (exit 0 when found).
// PowerShell's SaveAs2 hangs on this machine and save_doc.js can only see the
// first Word instance in the ROT, so this helper enumerates every ROT moniker
// and late-binds into each candidate via IDispatch.
using System;
using System.Collections.Generic;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Runtime.InteropServices.ComTypes;

static class SaveDocAll
{
    [DllImport("ole32.dll")]
    static extern int GetRunningObjectTable(int reserved, out IRunningObjectTable pprot);

    static IEnumerable<object> RotObjects()
    {
        IRunningObjectTable rot;
        if (GetRunningObjectTable(0, out rot) != 0 || rot == null) yield break;
        IEnumMoniker enumerator;
        rot.EnumRunning(out enumerator);
        if (enumerator == null) yield break;
        enumerator.Reset();
        IMoniker[] monikers = new IMoniker[1];
        while (enumerator.Next(1, monikers, IntPtr.Zero) == 0 && monikers[0] != null)
        {
            object obj = null;
            try { rot.GetObject(monikers[0], out obj); }
            catch { }
            finally { Marshal.ReleaseComObject(monikers[0]); }
            if (obj != null) yield return obj;
        }
        Marshal.ReleaseComObject(enumerator);
        Marshal.ReleaseComObject(rot);
    }

    static object TryGet(object target, string property)
    {
        try
        {
            return target.GetType().InvokeMember(
                property, BindingFlags.GetProperty, null, target, null);
        }
        catch { return null; }
    }

    static object FindDocument(string src)
    {
        foreach (object root in RotObjects())
        {
            object docs = TryGet(root, "Documents");
            if (docs == null) continue;
            object countObj = TryGet(docs, "Count");
            if (countObj == null) continue;
            int count = Convert.ToInt32(countObj);
            for (int i = 1; i <= count; i++)
            {
                object doc = null;
                try
                {
                    doc = docs.GetType().InvokeMember(
                        "Item", BindingFlags.InvokeMethod, null, docs, new object[] { i });
                }
                catch { }
                if (doc == null) continue;
                object fullName = TryGet(doc, "FullName");
                object name = TryGet(doc, "Name");
                string f = fullName == null ? "" : fullName.ToString();
                string n = name == null ? "" : name.ToString();
                if (string.Equals(f, src, StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(n, src, StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(f.ToLowerInvariant(), src.ToLowerInvariant(), StringComparison.Ordinal) ||
                    string.Equals(n.ToLowerInvariant(), src.ToLowerInvariant(), StringComparison.Ordinal))
                {
                    return doc;
                }
                Console.WriteLine("  cand: " + f);
            }
        }
        return null;
    }

    [STAThread]
    static int Main(string[] args)
    {
        if (args.Length < 2)
        {
            Console.WriteLine("usage: save_doc_all.exe <src> <dst> [fmt]");
            return 1;
        }
        string src = args[0];
        string dst = args[1];
        int fmt = args.Length > 2 ? int.Parse(args[2]) : 16;

        object doc = null;
        for (int attempt = 0; attempt < 12 && doc == null; attempt++)
            doc = FindDocument(src);

        if (doc == null)
        {
            Console.WriteLine("ERR: document not found in any Word instance: " + src);
            return 2;
        }
        if (dst == "-")
        {
            Console.WriteLine("FOUND " + TryGet(doc, "FullName"));
            return 0;
        }
        try
        {
            doc.GetType().InvokeMember(
                "SaveAs2", BindingFlags.InvokeMethod, null, doc, new object[] { dst, fmt });
            Console.WriteLine("SAVED " + dst);
            return 0;
        }
        catch (TargetInvocationException e)
        {
            Console.WriteLine("ERR: " + e.InnerException.Message);
            return 3;
        }
        catch (Exception e)
        {
            Console.WriteLine("ERR: " + e.Message);
            return 3;
        }
    }
}
