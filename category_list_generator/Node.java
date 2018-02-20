import java.util.ArrayList;
import java.util.List;
public class Node 
{
   private String data = null;
   private List<Node> children = new ArrayList<>();
   private Node parent = null;
   public Node(String data) 
   {
      this.data = data;
   } 
   public String getData() 
   {
      return this.data;
   }
   public void setData(String data) 
   {
      this.data = data;
   }
   private void setParent(Node parent) 
   {
      this.parent = parent;
   }
   public Node getParent() 
   {  
      return this.parent;
   }
   public Node addChild(Node child) 
   {
      child.setParent(this);
      this.children.add(child);
      return child;
   }
   public void addChildren(List<Node> children) 
   {
      children.forEach(each -> each.setParent(this));
      this.children.addAll(children);
   }
   public List<Node> getChildren() 
   {
      return this.children;
   }
   public boolean hasSibiling(Node node)
   {
       return node.getParent().getChildren().size()>1;
   }
   public List<Node> getSibilings(Node node) 
   {
      return node.getParent().getChildren();
   }
   public boolean hasChildren(Node node) 
   {
       return this.children.size()>0;
   }
   public Node getNode(Node node)
   {
       return node;
   }
}
