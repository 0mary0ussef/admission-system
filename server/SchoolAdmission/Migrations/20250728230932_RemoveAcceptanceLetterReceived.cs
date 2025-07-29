using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolAdmission.Migrations
{
    /// <inheritdoc />
    public partial class RemoveAcceptanceLetterReceived : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AcceptanceLetterReceived",
                table: "Students");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "AcceptanceLetterReceived",
                table: "Students",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }
    }
}
