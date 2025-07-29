using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolAdmission.Migrations
{
    /// <inheritdoc />
    public partial class AddDocumentUploadProperties : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BirthCertificatePath",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PreferencesSheetPath",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SuccessReportPath",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TuitionFeeReceiptPath",
                table: "Students",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BirthCertificatePath",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "PreferencesSheetPath",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "SuccessReportPath",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "TuitionFeeReceiptPath",
                table: "Students");
        }
    }
}
