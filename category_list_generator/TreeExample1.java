import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
public class TreeExample1 {
    public static int ak=0;
    public static String ans,name="../categoryList";
    public static Node ans_parent;
    private static List<String> answer = new ArrayList<>();
    private static List<Node> answer_parent = new ArrayList<>();
    private static List<String> ambiguous_terms = new ArrayList<>();
    private static List<String> hec = new ArrayList<>();
    static Scanner s=new Scanner(System.in);static long startTime,endTime;
    public static void main(String[] args) throws IOException
    {
        Node root = createTree();
        init();
        printTree(root, " ");
        System.out.println("Enter keyword");
        String key=s.next();
        startTime = System.nanoTime();
        search(root,key);
    }
    private static void init()
    {
        ambiguous_terms.add("Apple");
        ambiguous_terms.add("Samsung");
        ambiguous_terms.add("Android");
    }
    private static void printTree(Node node, String appender)
    {
        System.out.println(appender + node.getData());
        node.getChildren().forEach(each ->printTree(each, appender + "    "));
    }
    private static void search(Node node,String key)
    {
         key = key.toLowerCase();
         //System.out.println(node.getData());
         int j=-1;
         Node p;
         String from_user;
         if(node.getData().toLowerCase().contains(key))
         {
               ans=node.getData().toLowerCase();
               ans_parent=node.getParent();
               answer_parent.add(ans_parent);
               if(!answer.contains(ans))
               {
                   answer.add(ans);
               }
               else
               {
                ak++;
                j=answer.indexOf(ans);
                p=answer_parent.get(j);
                System.out.println("Which?"+p.getData()+" or "+ans_parent.getData()+"    (Type the first letter)");
                from_user=s.next();
                if(ans_parent.getData().toLowerCase().contains(from_user.toLowerCase()))
                {
                    print_from_root(ans_parent);
                    System.out.print(ans);
                    hec.add(ans);
                    print_to_file(hec);
                }
                else
                {
                    print_from_root(p);
                    System.out.print(ans);
                    hec.add(ans);
                    print_to_file(hec);
                }
               }
               if(!ambiguous_terms.contains(node.getData()) && ak==0)
               {
                   print_from_root(node.getParent());
                   System.out.println(node.getData());
                   hec.add(ans);
                   print_to_file(hec);
               }
         }
        else {
            final String lambdaString = new String(key);
            node.getChildren().forEach(each ->search(each, lambdaString));
        }
    }
    private static void print_to_file(List<String> got)
    {
        FileWriter fw=null;
        PrintWriter pw=null;
        String sep = System.lineSeparator();
        try
        {
            fw = new FileWriter(name);
            pw = new PrintWriter(fw);
            pw.print(got.get(0));
            if(got.size()>1)
            {
                for (int x=1; x<hec.size(); x++)
                    pw.print(sep+hec.get(x));
            }
        }
        catch(IOException e){}
        finally
        {
            try
            {
                if(fw != null){
                    fw.close();
                }
                if(pw != null){
                    pw.close();
                }
            }
            catch (IOException e){}
        }
    }
    private static void print_from_root(Node to_print)
    {
        if(!to_print.getData().contains("Articles"))
            print_from_root(to_print.getParent());
        System.out.print(to_print.getData()+" -> ");
    }
    private static Node createTree()
    {
        Node root = new Node("Articles");

        Node arts = root.addChild(new Node("Arts"));
        Node visual_arts = arts.addChild(new Node("Intellectual works"));
        Node museum = visual_arts.addChild(new Node("Creative works"));
        Node painting = visual_arts.addChild(new Node("Fiction"));
        Node books = arts.addChild(new Node("Books"));

        Node business = root.addChild(new Node("Culture"));

        Node vital_articles = root.addChild(new Node("Wikipedia vital articles by topic"));
        Node va_1 = vital_articles.addChild(new Node("Wikipedia vital articles in Health and Medicine"));
        Node va_2 = vital_articles.addChild(new Node("Wikipedia vital articles in Mathematics"));
        Node va_3 = vital_articles.addChild(new Node("Wikipedia vital articles in Philosophy"));
        Node va_4 = vital_articles.addChild(new Node("Wikipedia vital articles in People"));
        Node va_5 = vital_articles.addChild(new Node("Wikipedia vital articles in Technology"));
        Node va_6 = vital_articles.addChild(new Node("Wikipedia vital articles in Science"));

        Node health = root.addChild(new Node("Health and fitness"));

        Node engineering = root.addChild(new Node("Electricity"));

        Node entertainment = root.addChild(new Node("Entertainment"));

        Node life = root.addChild(new Node("Life"));

        Node aerospace_engineering = engineering.addChild(new Node("Aerospace Engineering"));
        Node mechanical_engineering = engineering.addChild(new Node("Mechanical Engineering"));
        Node gaming = entertainment.addChild(new Node("Games"));
        Node online_games = gaming.addChild(new Node("Open-source games"));
        Node indoor_games = gaming.addChild(new Node("Game characters"));
        Node indoor_chess = gaming.addChild(new Node("Chess"));
        Node sudoku = gaming.addChild(new Node("Sudoku"));
        Node television = entertainment.addChild(new Node("Companies"));
        Node tv_samsung = television.addChild(new Node("Electronics_companies"));
        Node tv_android = television.addChild(new Node("Open content companies"));

        Node maths = root.addChild(new Node("Mathematics"));

        Node nature = root.addChild(new Node("Nature"));

        Node religion = root.addChild(new Node("Religion"));
        return root;
    }
}
